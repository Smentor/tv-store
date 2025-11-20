"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Zap, Crown, Rocket, X, Tag, Percent } from 'lucide-react'
import { useSubscription } from "@/hooks/use-subscription"
import { usePlans } from "@/hooks/use-plans"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PlansSectionProps {
  setCurrentView: (view: string) => void
}

const PLAN_ICONS: Record<string, any> = {
  basic: Zap,
  premium: Crown,
  "premium-plus": Rocket,
}

export function PlansSection({ setCurrentView }: PlansSectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [activePromotions, setActivePromotions] = useState<any[]>([])
  const [loadingCoupon, setLoadingCoupon] = useState(false)
  
  const { subscription, refetch } = useSubscription()
  const { plans, loading: loadingPlans } = usePlans()
  const { toast } = useToast()

  const currentPlanId = subscription?.plan_id || "basic"

  useEffect(() => {
    loadActivePromotions()
  }, [])

  const loadActivePromotions = async () => {
    const supabase = createClient()
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('active', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
    
    if (!error && data) {
      setActivePromotions(data)
    }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Código requerido",
        description: "Por favor ingresa un código de cupón",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setLoadingCoupon(true)
    const supabase = createClient()
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('active', true)
      .single()
    
    if (error || !data) {
      toast({
        title: "Cupón inválido",
        description: "El código ingresado no existe o ha expirado",
        variant: "destructive",
        duration: 3000,
      })
      setLoadingCoupon(false)
      return
    }

    if (data.start_date && new Date(data.start_date) > new Date(now)) {
      toast({
        title: "Cupón no disponible",
        description: "Este cupón aún no está disponible",
        variant: "destructive",
        duration: 3000,
      })
      setLoadingCoupon(false)
      return
    }

    if (data.end_date && new Date(data.end_date) < new Date(now)) {
      toast({
        title: "Cupón expirado",
        description: "Este cupón ya no está disponible",
        variant: "destructive",
        duration: 3000,
      })
      setLoadingCoupon(false)
      return
    }

    if (data.max_uses && data.current_uses >= data.max_uses) {
      toast({
        title: "Cupón agotado",
        description: "Este cupón ya alcanzó su límite de usos",
        variant: "destructive",
        duration: 3000,
      })
      setLoadingCoupon(false)
      return
    }

    setAppliedCoupon(data)
    toast({
      title: "Cupón aplicado",
      description: `Has obtenido un descuento de ${data.discount_percentage ? `${data.discount_percentage}%` : `S/ ${data.discount_amount}`}`,
      variant: "success",
      duration: 3000,
    })
    setLoadingCoupon(false)
  }

  const calculateFinalPrice = (basePrice: number) => {
    let finalPrice = basePrice

    if (activePromotions.length > 0) {
      const promo = activePromotions[0]
      if (promo.discount_percentage) {
        finalPrice -= (finalPrice * promo.discount_percentage) / 100
      } else if (promo.discount_amount) {
        finalPrice -= promo.discount_amount
      }
    }

    if (appliedCoupon) {
      if (appliedCoupon.discount_percentage) {
        finalPrice -= (finalPrice * appliedCoupon.discount_percentage) / 100
      } else if (appliedCoupon.discount_amount) {
        finalPrice -= appliedCoupon.discount_amount
      }
    }

    return Math.max(0, finalPrice)
  }

  const handlePlanChange = (planId: string) => {
    if (planId === currentPlanId) {
      toast({
        title: "Plan actual",
        description: "Ya tienes este plan activo",
        variant: "destructive",
        duration: 3000,
      })
      return
    }
    setSelectedPlan(planId)
    setShowConfirmModal(true)
  }

  const confirmPlanChange = async () => {
    if (!selectedPlan || !subscription) return

    setIsProcessing(true)

    try {
      const supabase = createClient()
      const selectedPlanData = plans.find((p) => p.id === selectedPlan)

      if (!selectedPlanData) throw new Error("Plan no encontrado")

      const finalPrice = calculateFinalPrice(selectedPlanData.price)

      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          plan_id: selectedPlanData.id,
          plan_name: selectedPlanData.name,
          price: finalPrice,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", subscription.user_id)

      if (updateError) throw updateError

      if (appliedCoupon) {
        await supabase
          .from('coupons')
          .update({ current_uses: appliedCoupon.current_uses + 1 })
          .eq('id', appliedCoupon.id)
      }

      await supabase.from("invoices").insert({
        user_id: subscription.user_id,
        amount: finalPrice,
        status: "paid",
        description: `Cambio a ${selectedPlanData.name}${appliedCoupon ? ` (Cupón: ${appliedCoupon.code})` : ''}${activePromotions.length > 0 ? ` (Promoción aplicada)` : ''}`,
        invoice_date: new Date().toISOString(),
      })

      await refetch()

      toast({
        title: "Plan actualizado exitosamente",
        description: `Te hemos cambiado al plan ${selectedPlanData.name}${finalPrice < selectedPlanData.price ? ` con descuento aplicado` : ''}.`,
        variant: "success",
        duration: 3000,
      })

      setShowConfirmModal(false)
      setSelectedPlan(null)
      setAppliedCoupon(null)
      setCouponCode("")
    } catch (error) {
      console.error("Error cambiando plan:", error)
      toast({
        title: "Error al cambiar plan",
        description: "No se pudo cambiar el plan. Por favor, intenta de nuevo.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (loadingPlans) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Planes y Suscripción</h2>
          <p className="text-muted-foreground">Cargando planes disponibles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Planes y Suscripción</h2>
        <p className="text-muted-foreground">
          Tu plan actual: <span className="font-semibold text-primary">{subscription?.plan_name || "Cargando..."}</span>
        </p>
      </div>

      {activePromotions.length > 0 && (
        <Card className="p-4 border-2 border-orange-500 bg-orange-50">
          <div className="flex items-start gap-3">
            <Percent className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-orange-900 mb-1">
                ¡Promoción Activa! {activePromotions[0].name}
              </h3>
              <p className="text-sm text-orange-700 mb-2">
                {activePromotions[0].description}
              </p>
              <div className="inline-flex items-center gap-2 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {activePromotions[0].discount_percentage ? (
                  <>{activePromotions[0].discount_percentage}% de descuento</>
                ) : (
                  <>S/ {activePromotions[0].discount_amount} de descuento</>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 w-full">
            <Label htmlFor="coupon-code" className="text-green-900 font-semibold flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4" />
              ¿Tienes un código de cupón?
            </Label>
            <Input
              id="coupon-code"
              placeholder="Ingresa tu código"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              disabled={!!appliedCoupon || loadingCoupon}
              className="uppercase"
            />
          </div>
          {!appliedCoupon ? (
            <Button 
              onClick={applyCoupon} 
              disabled={loadingCoupon || !couponCode.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loadingCoupon ? "Validando..." : "Aplicar Cupón"}
            </Button>
          ) : (
            <Button 
              onClick={() => {
                setAppliedCoupon(null)
                setCouponCode("")
                toast({
                  title: "Cupón removido",
                  description: "El cupón ha sido removido",
                  duration: 3000,
                })
              }}
              variant="outline"
              className="border-green-600 text-green-600"
            >
              Remover Cupón
            </Button>
          )}
        </div>
        {appliedCoupon && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-100 px-3 py-2 rounded-lg">
            <Check className="w-4 h-4" />
            <span className="font-semibold">Cupón "{appliedCoupon.code}" aplicado exitosamente</span>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {plans.map((plan) => {
          const Icon = PLAN_ICONS[plan.id] || Zap
          const isCurrent = currentPlanId === plan.id
          const features = Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || "[]")
          const originalPrice = plan.price
          const finalPrice = calculateFinalPrice(originalPrice)
          const hasDiscount = finalPrice < originalPrice

          return (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 ${
                isCurrent 
                  ? "border-2 border-primary shadow-2xl shadow-primary/30 sm:scale-105" 
                  : "border border-border hover:border-accent/50 hover:shadow-lg"
              }`}
            >
              {isCurrent && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary via-accent to-primary text-white px-3 py-2 text-center font-bold text-xs sm:text-sm animate-gradient">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  TU PLAN ACTUAL
                </div>
              )}

              <div className={`p-4 sm:p-6 space-y-4 sm:space-y-5 ${isCurrent ? "pt-12 sm:pt-14" : "pt-4 sm:pt-6"}`}>
                <div className="space-y-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
                    isCurrent ? "bg-primary/20 ring-2 ring-primary/50" : "bg-muted"
                  }`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isCurrent ? "text-primary" : "text-foreground"}`} />
                  </div>
                  
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{plan.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
                  </div>
                </div>

                <div className="border-y border-border py-3">
                  {hasDiscount ? (
                    <div>
                      <div className="flex items-baseline gap-1 line-through text-muted-foreground opacity-60">
                        <span className="text-2xl font-bold">${originalPrice}</span>
                        <span className="text-base">/mes</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-bold text-green-600">${finalPrice.toFixed(2)}</span>
                        <span className="text-green-600 text-base sm:text-lg">/mes</span>
                      </div>
                      <div className="text-xs text-green-600 font-semibold mt-1">
                        ¡Ahorra ${(originalPrice - finalPrice).toFixed(2)}!
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-bold text-foreground">${plan.price}</span>
                      <span className="text-muted-foreground text-base sm:text-lg">/mes</span>
                    </div>
                  )}
                </div>

                <ul className="space-y-2 sm:space-y-3">
                  {features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        isCurrent ? "text-primary" : "text-accent"
                      }`} />
                      <span className="text-foreground leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePlanChange(plan.id)}
                  disabled={isProcessing || isCurrent}
                  size="lg"
                  className={`w-full font-semibold text-sm sm:text-base transition-all ${
                    isCurrent
                      ? "bg-gradient-to-r from-primary to-accent text-white cursor-default opacity-90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Plan Activo
                    </>
                  ) : (
                    "Seleccionar Plan"
                  )}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Crown className="w-6 h-6 text-primary" />
              Confirmar Cambio de Plan
            </DialogTitle>
            <div className="text-muted-foreground text-base pt-4 space-y-4">
              <p>
                Estás a punto de cambiar al plan{" "}
                <span className="font-semibold text-primary">
                  {plans.find((p) => p.id === selectedPlan)?.name}
                </span>
                .
              </p>
              <div className="bg-muted rounded-lg p-4 space-y-2">
                {selectedPlan && (() => {
                  const plan = plans.find((p) => p.id === selectedPlan)
                  if (!plan) return null
                  const originalPrice = plan.price
                  const finalPrice = calculateFinalPrice(originalPrice)
                  const hasDiscount = finalPrice < originalPrice
                  
                  return (
                    <>
                      {hasDiscount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Precio original:</span>
                          <span className="line-through text-muted-foreground">${originalPrice}/mes</span>
                        </div>
                      )}
                      {activePromotions.length > 0 && (
                        <div className="flex justify-between text-sm text-orange-600">
                          <span>Promoción activa:</span>
                          <span className="font-semibold">
                            -{activePromotions[0].discount_percentage ? `${activePromotions[0].discount_percentage}%` : `$${activePromotions[0].discount_amount}`}
                          </span>
                        </div>
                      )}
                      {appliedCoupon && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Cupón ({appliedCoupon.code}):</span>
                          <span className="font-semibold">
                            -{appliedCoupon.discount_percentage ? `${appliedCoupon.discount_percentage}%` : `$${appliedCoupon.discount_amount}`}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm border-t pt-2">
                        <span className="font-semibold text-foreground">Precio final:</span>
                        <span className={`font-bold text-lg ${hasDiscount ? 'text-green-600' : 'text-foreground'}`}>
                          ${finalPrice.toFixed(2)}/mes
                        </span>
                      </div>
                      {hasDiscount && (
                        <div className="text-center text-xs text-green-600 font-semibold bg-green-50 py-1 rounded">
                          ¡Ahorras ${(originalPrice - finalPrice).toFixed(2)} al mes!
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
              <p className="text-sm text-muted-foreground">
                El cambio se aplicará inmediatamente. Se te cobrará la nueva tarifa de forma proporcional.
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowConfirmModal(false)
                setSelectedPlan(null)
              }}
              disabled={isProcessing}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={confirmPlanChange}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90"
            >
              {isProcessing ? (
                "Procesando..."
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar Cambio
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="p-6 border border-border bg-card">
        <h3 className="text-xl font-bold text-foreground mb-4">¿Necesitas ayuda para elegir?</h3>
        <p className="text-muted-foreground mb-4">
          Todos nuestros planes incluyen acceso a más de 1000 canales internacionales, VOD ilimitado y compatibilidad
          con todos los dispositivos populares.
        </p>
        <Button variant="outline">Contactar Soporte</Button>
      </Card>
    </div>
  )
}
