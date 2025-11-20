'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createBrowserClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Ticket, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Promotion {
  id: string
  name: string
  description: string
  discount_percentage: number | null
  discount_amount: number | null
  active: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
}

export default function PromotionsManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_percentage: '',
    discount_amount: '',
    active: true,
    start_date: '',
    end_date: '',
  })

  useEffect(() => {
    loadPromotions()
  }, [])

  const loadPromotions = async () => {
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al cargar promociones',
        description: error.message,
        duration: 3000,
      })
    } else {
      setPromotions(data || [])
    }
    setLoading(false)
  }

  const handleOpenDialog = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion)
      setFormData({
        name: promotion.name,
        description: promotion.description || '',
        discount_type: promotion.discount_percentage ? 'percentage' : 'amount',
        discount_percentage: promotion.discount_percentage?.toString() || '',
        discount_amount: promotion.discount_amount?.toString() || '',
        active: promotion.active,
        start_date: promotion.start_date ? promotion.start_date.split('T')[0] : '',
        end_date: promotion.end_date ? promotion.end_date.split('T')[0] : '',
      })
    } else {
      setEditingPromotion(null)
      setFormData({
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_percentage: '',
        discount_amount: '',
        active: true,
        start_date: '',
        end_date: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSavePromotion = async () => {
    const supabase = createBrowserClient()

    const promotionData: any = {
      name: formData.name,
      description: formData.description,
      active: formData.active,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    }

    if (formData.discount_type === 'percentage') {
      promotionData.discount_percentage = parseInt(formData.discount_percentage)
      promotionData.discount_amount = null
    } else {
      promotionData.discount_amount = parseFloat(formData.discount_amount)
      promotionData.discount_percentage = null
    }

    let error

    if (editingPromotion) {
      const result = await supabase
        .from('promotions')
        .update(promotionData)
        .eq('id', editingPromotion.id)
      error = result.error
    } else {
      const result = await supabase
        .from('promotions')
        .insert([promotionData])
      error = result.error
    }

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al guardar promoción',
        description: error.message,
        duration: 3000,
      })
    } else {
      toast({
        variant: 'success',
        title: editingPromotion ? 'Promoción actualizada' : 'Promoción creada',
        description: `La promoción ha sido ${editingPromotion ? 'actualizada' : 'creada'} exitosamente`,
        duration: 3000,
      })
      setIsDialogOpen(false)
      loadPromotions()
    }
  }

  const handleDeletePromotion = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta promoción?')) return

    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al eliminar promoción',
        description: error.message,
        duration: 3000,
      })
    } else {
      toast({
        variant: 'success',
        title: 'Promoción eliminada',
        description: 'La promoción ha sido eliminada exitosamente',
        duration: 3000,
      })
      loadPromotions()
    }
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('promotions')
      .update({ active: !currentActive })
      .eq('id', id)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
        duration: 3000,
      })
    } else {
      loadPromotions()
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
          <h2 className="text-2xl font-bold">Gestión de Promociones</h2>
          <p className="text-muted-foreground">Crea promociones temporales con descuentos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Promoción
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPromotion ? 'Editar Promoción' : 'Nueva Promoción'}</DialogTitle>
              <DialogDescription>
                {editingPromotion ? 'Modifica los detalles de la promoción' : 'Crea una nueva promoción temporal'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="promo-name">Nombre de la Promoción</Label>
                <Input
                  id="promo-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Descuento de Verano"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-description">Descripción</Label>
                <Textarea
                  id="promo-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción de la promoción"
                  rows={3}
                />
              </div>
              <div className="space-y-4">
                <Label>Tipo de Descuento</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="discount_type"
                      value="percentage"
                      checked={formData.discount_type === 'percentage'}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                      className="w-4 h-4"
                    />
                    <span>Porcentaje (%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="discount_type"
                      value="amount"
                      checked={formData.discount_type === 'amount'}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                      className="w-4 h-4"
                    />
                    <span>Monto Fijo (S/)</span>
                  </label>
                </div>
              </div>
              {formData.discount_type === 'percentage' ? (
                <div className="space-y-2">
                  <Label htmlFor="discount-percentage">Porcentaje de Descuento</Label>
                  <Input
                    id="discount-percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                    placeholder="20"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="discount-amount">Monto de Descuento (S/)</Label>
                  <Input
                    id="discount-amount"
                    type="number"
                    step="0.01"
                    value={formData.discount_amount}
                    onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                    placeholder="10.00"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Fecha de Inicio</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">Fecha de Fin</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="active-switch">Activar Promoción</Label>
                <Switch
                  id="active-switch"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSavePromotion}>
                  {editingPromotion ? 'Actualizar' : 'Crear'} Promoción
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promo) => (
          <Card key={promo.id} className={`hover:shadow-lg transition-shadow ${!promo.active ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-orange-500" />
                    {promo.name}
                  </CardTitle>
                  <CardDescription className="mt-2">{promo.description}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleOpenDialog(promo)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeletePromotion(promo.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-orange-600">
                  {promo.discount_percentage ? `${promo.discount_percentage}%` : `S/ ${promo.discount_amount?.toFixed(2)}`}
                </span>
                <span className="text-sm text-muted-foreground">de descuento</span>
              </div>
              {(promo.start_date || promo.end_date) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {promo.start_date && new Date(promo.start_date).toLocaleDateString()}
                    {promo.start_date && promo.end_date && ' - '}
                    {promo.end_date && new Date(promo.end_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">
                  {promo.active ? 'Activa' : 'Inactiva'}
                </span>
                <Switch
                  checked={promo.active}
                  onCheckedChange={() => toggleActive(promo.id, promo.active)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
