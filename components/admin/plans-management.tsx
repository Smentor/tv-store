'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createBrowserClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Package } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  max_screens: number
  plan_type: string
  plan_type_id: string
  created_at: string
}

export default function PlansManagement() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    features: '',
    max_screens: '1',
    plan_type: '',
    plan_type_id: '',
  })

  const parsePlanType = (planType: string) => {
    if (!planType) return { id: '', name: '' }
    const parts = planType.split(':')
    if (parts.length === 2) {
      return { id: parts[0], name: parts[1] }
    }
    return { id: '', name: planType }
  }

  // Helper function to combine ID and Name into single field "ID:Name"
  const combinePlanType = (id: string, name: string) => {
    if (!id || !name) return name || ''
    return `${id}:${name}`
  }

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('price', { ascending: true })

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al cargar planes',
        description: error.message,
        duration: 3000,
      })
    } else {
      setPlans(data || [])
    }
    setLoading(false)
  }

  const handleOpenDialog = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan)
      setFormData({
        name: plan.name,
        description: plan.description,
        price: plan.price.toString(),
        features: plan.features.join('\n'),
        max_screens: plan.max_screens?.toString() || '1',
        plan_type: plan.plan_type || '',
        plan_type_id: plan.plan_type_id || '',
      })
    } else {
      setEditingPlan(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        features: '',
        max_screens: '1',
        plan_type: '',
        plan_type_id: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSavePlan = async () => {
    const supabase = createBrowserClient()

    const planData: any = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      features: formData.features.split('\n').filter(f => f.trim()),
      max_screens: parseInt(formData.max_screens),
      plan_type: formData.plan_type || null,
      plan_type_id: formData.plan_type_id || null,
    }

    if (!editingPlan) {
      planData.id = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      planData.id = `${planData.id}-${Date.now()}`
    }

    let error

    if (editingPlan) {
      const result = await supabase
        .from('plans')
        .update(planData)
        .eq('id', editingPlan.id)
      error = result.error
    } else {
      const result = await supabase
        .from('plans')
        .insert([planData])
      error = result.error
    }

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al guardar plan',
        description: error.message,
        duration: 3000,
      })
    } else {
      toast({
        variant: 'success',
        title: editingPlan ? 'Plan actualizado' : 'Plan creado',
        description: `El plan ha sido ${editingPlan ? 'actualizado' : 'creado'} exitosamente`,
        duration: 3000,
      })
      setIsDialogOpen(false)
      loadPlans()
    }
  }

  const handleDeletePlan = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este plan?')) return

    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', id)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al eliminar plan',
        description: error.message,
        duration: 3000,
      })
    } else {
      toast({
        variant: 'success',
        title: 'Plan eliminado',
        description: 'El plan ha sido eliminado exitosamente',
        duration: 3000,
      })
      loadPlans()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Paquetes</h2>
          <p className="text-muted-foreground">Administra los planes de suscripción disponibles</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Paquete
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Editar Paquete' : 'Nuevo Paquete'}</DialogTitle>
              <DialogDescription>
                {editingPlan ? 'Modifica los detalles del paquete' : 'Crea un nuevo paquete de suscripción'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Paquete</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Básico"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del paquete"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio (S/)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_screens">Número de Pantallas Simultáneas</Label>
                <Input
                  id="max_screens"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.max_screens}
                  onChange={(e) => setFormData({ ...formData, max_screens: e.target.value })}
                  placeholder="1"
                />
                <p className="text-xs text-muted-foreground">
                  Cantidad de dispositivos que pueden ver simultáneamente
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan_type_id">ID del Tipo de Paquete</Label>
                  <Input
                    id="plan_type_id"
                    type="text"
                    value={formData.plan_type_id}
                    onChange={(e) => setFormData({ ...formData, plan_type_id: e.target.value })}
                    placeholder="Ej: 1, 4, 10 o 2,4,5"
                  />
                  <p className="text-xs text-muted-foreground">
                    ID numérico para el backend (puede ser múltiple: 2,4,5)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan_type">Nombre del Tipo de Paquete</Label>
                  <Input
                    id="plan_type"
                    value={formData.plan_type}
                    onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                    placeholder="Ej: Gold, Silver"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nombre del tipo de paquete
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Características (una por línea)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Canales HD&#10;Soporte 24/7&#10;Sin publicidad"
                  rows={6}
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSavePlan}>
                  {editingPlan ? 'Actualizar' : 'Crear'} Paquete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {plans.map((plan) => {
          return (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Package className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="truncate">{plan.name}</span>
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs line-clamp-2">{plan.description}</CardDescription>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handleOpenDialog(plan)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex-1 flex flex-col">
                <div className="text-2xl font-bold text-primary">
                  S/ {plan.price.toFixed(2)}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                    {plan.max_screens} {plan.max_screens === 1 ? 'pantalla' : 'pantallas'}
                  </span>
                  {plan.plan_type && (
                    <span className="bg-accent/10 text-accent px-2 py-0.5 rounded font-medium">
                      {plan.plan_type}
                    </span>
                  )}
                  {plan.plan_type_id && (
                    <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium">
                      ID: {plan.plan_type_id}
                    </span>
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <ul className="space-y-1">
                    {plan.features.slice(0, 5).map((feature, idx) => (
                      <li key={idx} className="text-xs flex items-start gap-1.5">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                        <span className="line-clamp-2">{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 5 && (
                      <li className="text-xs text-muted-foreground italic">
                        +{plan.features.length - 5} más...
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
