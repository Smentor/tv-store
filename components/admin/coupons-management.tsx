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
import { Plus, Edit, Trash2, Gift, Copy, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Coupon {
  id: string
  code: string
  description: string
  discount_percentage: number | null
  discount_amount: number | null
  max_uses: number | null
  current_uses: number
  active: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
}

export default function CouponsManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_percentage: '',
    discount_amount: '',
    max_uses: '',
    active: true,
    start_date: '',
    end_date: '',
  })

  useEffect(() => {
    loadCoupons()
  }, [])

  const loadCoupons = async () => {
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al cargar cupones',
        description: error.message,
        duration: 3000,
      })
    } else {
      setCoupons(data || [])
    }
    setLoading(false)
  }

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, code })
  }

  const handleOpenDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon)
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discount_type: coupon.discount_percentage ? 'percentage' : 'amount',
        discount_percentage: coupon.discount_percentage?.toString() || '',
        discount_amount: coupon.discount_amount?.toString() || '',
        max_uses: coupon.max_uses?.toString() || '',
        active: coupon.active,
        start_date: coupon.start_date ? coupon.start_date.split('T')[0] : '',
        end_date: coupon.end_date ? coupon.end_date.split('T')[0] : '',
      })
    } else {
      setEditingCoupon(null)
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_percentage: '',
        discount_amount: '',
        max_uses: '',
        active: true,
        start_date: '',
        end_date: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSaveCoupon = async () => {
    const supabase = createBrowserClient()

    const couponData: any = {
      code: formData.code.toUpperCase(),
      description: formData.description,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      active: formData.active,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    }

    if (formData.discount_type === 'percentage') {
      couponData.discount_percentage = parseInt(formData.discount_percentage)
      couponData.discount_amount = null
    } else {
      couponData.discount_amount = parseFloat(formData.discount_amount)
      couponData.discount_percentage = null
    }

    let error

    if (editingCoupon) {
      const result = await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', editingCoupon.id)
      error = result.error
    } else {
      const result = await supabase
        .from('coupons')
        .insert([{ ...couponData, current_uses: 0 }])
      error = result.error
    }

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al guardar cupón',
        description: error.message,
        duration: 3000,
      })
    } else {
      toast({
        variant: 'success',
        title: editingCoupon ? 'Cupón actualizado' : 'Cupón creado',
        description: `El cupón ha sido ${editingCoupon ? 'actualizado' : 'creado'} exitosamente`,
        duration: 3000,
      })
      setIsDialogOpen(false)
      loadCoupons()
    }
  }

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cupón?')) return

    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al eliminar cupón',
        description: error.message,
        duration: 3000,
      })
    } else {
      toast({
        variant: 'success',
        title: 'Cupón eliminado',
        description: 'El cupón ha sido eliminado exitosamente',
        duration: 3000,
      })
      loadCoupons()
    }
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('coupons')
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
      loadCoupons()
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      variant: 'success',
      title: 'Código copiado',
      description: `El código ${code} ha sido copiado al portapapeles`,
      duration: 3000,
    })
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
          <h2 className="text-2xl font-bold">Gestión de Cupones</h2>
          <p className="text-muted-foreground">Crea códigos de descuento únicos para tus clientes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Cupón
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}</DialogTitle>
              <DialogDescription>
                {editingCoupon ? 'Modifica los detalles del cupón' : 'Crea un nuevo código de descuento'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-code">Código del Cupón</Label>
                <div className="flex gap-2">
                  <Input
                    id="coupon-code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="VERANO2024"
                    className="uppercase"
                  />
                  <Button type="button" variant="outline" onClick={generateRandomCode}>
                    Generar
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-description">Descripción</Label>
                <Textarea
                  id="coupon-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del cupón"
                  rows={3}
                />
              </div>
              <div className="space-y-4">
                <Label>Tipo de Descuento</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="coupon_discount_type"
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
                      name="coupon_discount_type"
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
                  <Label htmlFor="coupon-discount-percentage">Porcentaje de Descuento</Label>
                  <Input
                    id="coupon-discount-percentage"
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
                  <Label htmlFor="coupon-discount-amount">Monto de Descuento (S/)</Label>
                  <Input
                    id="coupon-discount-amount"
                    type="number"
                    step="0.01"
                    value={formData.discount_amount}
                    onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                    placeholder="10.00"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="max-uses">Usos Máximos (opcional)</Label>
                <Input
                  id="max-uses"
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  placeholder="Ilimitado"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coupon-start-date">Fecha de Inicio</Label>
                  <Input
                    id="coupon-start-date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coupon-end-date">Fecha de Fin</Label>
                  <Input
                    id="coupon-end-date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="coupon-active-switch">Activar Cupón</Label>
                <Switch
                  id="coupon-active-switch"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveCoupon}>
                  {editingCoupon ? 'Actualizar' : 'Crear'} Cupón
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {coupons.map((coupon) => (
          <Card key={coupon.id} className={`hover:shadow-lg transition-shadow ${!coupon.active ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-green-500" />
                    <code className="text-lg font-mono bg-slate-100 px-2 py-1 rounded">
                      {coupon.code}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(coupon.code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </CardTitle>
                  <CardDescription className="mt-2">{coupon.description}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleOpenDialog(coupon)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-600">
                  {coupon.discount_percentage ? `${coupon.discount_percentage}%` : `S/ ${coupon.discount_amount?.toFixed(2)}`}
                </span>
                <span className="text-sm text-muted-foreground">de descuento</span>
              </div>
              <div className="space-y-2 text-sm">
                {coupon.max_uses && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Usos:</span>
                    <span className="font-medium">
                      {coupon.current_uses} / {coupon.max_uses}
                    </span>
                  </div>
                )}
                {(coupon.start_date || coupon.end_date) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {coupon.start_date && new Date(coupon.start_date).toLocaleDateString()}
                      {coupon.start_date && coupon.end_date && ' - '}
                      {coupon.end_date && new Date(coupon.end_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">
                  {coupon.active ? 'Activo' : 'Inactivo'}
                </span>
                <Switch
                  checked={coupon.active}
                  onCheckedChange={() => toggleActive(coupon.id, coupon.active)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
