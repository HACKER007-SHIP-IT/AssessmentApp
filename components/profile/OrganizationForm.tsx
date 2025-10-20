"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Loader2, Upload, X, Info, AlertCircle } from "lucide-react"
import { organizationUpdateSchema, type OrganizationUpdateInput, timezoneOptions } from "@/lib/validation/profile"
import { updateOrganizationProfile, uploadOrgLogo, updateBrandColor } from "@/lib/actions/organizations"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface OrganizationFormProps {
  organization: {
    id: string
    name: string
    email?: string
    phone?: string
    address?: string
    legal_name?: string
    billing_email?: string
    timezone?: string
    logo_url?: string
    brand_color?: string
  }
  role: 'owner' | 'admin'
}

/**
 * OrganizationForm Component
 *
 * Comprehensive organization management form with:
 * - Logo upload with preview
 * - Brand color picker with live preview
 * - All organization fields (name, contact details, legal, billing)
 * - Timezone selection
 * - Owner-only editing (admin users see read-only)
 * - Optimistic UI updates
 */
export function OrganizationForm({ organization, role }: OrganizationFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(organization.logo_url || null)
  const [brandColor, setBrandColor] = useState(organization.brand_color || '#0066CC')
  const [updatingColor, setUpdatingColor] = useState(false)

  const isOwner = role === 'owner'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OrganizationUpdateInput>({
    resolver: zodResolver(organizationUpdateSchema),
    defaultValues: {
      name: organization.name,
      email: organization.email || '',
      phone: organization.phone || '',
      address: organization.address || '',
      legal_name: organization.legal_name || '',
      billing_email: organization.billing_email || '',
      timezone: organization.timezone || 'Europe/London',
    },
  })

  const selectedTimezone = watch('timezone')

  // Handle logo file selection
  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Only PNG and JPEG images are allowed",
      })
      return
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "File size must be less than 2MB",
      })
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadOrgLogo(formData)

      if (result.success) {
        toast({
          title: "Logo uploaded",
          description: "Your organization logo has been updated",
        })
        router.refresh()
      } else {
        throw new Error('Upload failed')
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload logo",
      })
      setLogoPreview(organization.logo_url || null)
    } finally {
      setUploadingLogo(false)
    }
  }

  // Handle brand color change
  const handleColorChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setBrandColor(newColor)

    // Debounce color update
    if (updatingColor) return

    setUpdatingColor(true)
    try {
      const result = await updateBrandColor(newColor)
      if (result.success) {
        router.refresh()
      }
    } catch (error) {
      // Silent fail for color updates
    } finally {
      setTimeout(() => setUpdatingColor(false), 500)
    }
  }

  // Handle form submission
  const onSubmit = async (data: OrganizationUpdateInput) => {
    setIsSubmitting(true)

    try {
      const result = await updateOrganizationProfile(data)

      if (result.success) {
        toast({
          title: "Organization updated",
          description: "Your organization details have been saved",
        })
        router.refresh()
      } else {
        throw new Error('Update failed')
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Failed to update organization",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Organization Details
        </CardTitle>
        <CardDescription>
          {isOwner
            ? "Manage your organization's information and branding"
            : "View your organization's information (owner-only editing)"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Admin Warning Banner */}
        {!isOwner && (
          <div className="p-4 rounded-lg border bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">View Only</p>
                <p className="text-sm text-amber-800 mt-1">
                  Only organization owners can modify these settings. Contact your organization owner to make changes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Logo Upload */}
        <div className="space-y-3">
          <Label>Organization Logo</Label>
          <div className="flex items-start gap-4">
            {/* Logo Preview */}
            <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Organization logo"
                  width={96}
                  height={96}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Building2 className="h-8 w-8 text-gray-400" />
              )}
            </div>

            {/* Upload Button */}
            <div className="flex-1 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleLogoSelect}
                className="hidden"
                disabled={!isOwner || uploadingLogo}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={!isOwner || uploadingLogo}
              >
                {uploadingLogo ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                PNG or JPEG, max 2MB. Recommended size: 500x500px
              </p>
            </div>
          </div>
        </div>

        {/* Brand Color */}
        <div className="space-y-2">
          <Label htmlFor="brandColor">Brand Color</Label>
          <div className="flex items-center gap-3">
            <Input
              id="brandColor"
              type="color"
              value={brandColor}
              onChange={handleColorChange}
              className="w-20 h-12 p-1 cursor-pointer"
              disabled={!isOwner}
            />
            <Input
              type="text"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="flex-1"
              placeholder="#0066CC"
              disabled={!isOwner}
            />
            {/* Live Preview Chip */}
            <div
              className="w-12 h-12 rounded-lg border-2 shadow-sm"
              style={{ backgroundColor: brandColor }}
              title={`Preview: ${brandColor}`}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Used in headers, trainer console, and emails
          </p>
        </div>

        <hr className="my-6" />

        {/* Organization Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              className={errors.name ? "border-destructive" : ""}
              disabled={!isOwner || isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Contact Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Organization Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="contact@example.com"
                className={errors.email ? "border-destructive" : ""}
                disabled={!isOwner || isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+44 20 1234 5678"
                className={errors.phone ? "border-destructive" : ""}
                disabled={!isOwner || isSubmitting}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="123 Main Street, London, UK"
              disabled={!isOwner || isSubmitting}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          {/* Legal & Billing */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="legal_name">Legal Name</Label>
              <Input
                id="legal_name"
                {...register('legal_name')}
                placeholder="Used on invoices"
                disabled={!isOwner || isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Official registered company name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_email">Billing Email</Label>
              <Input
                id="billing_email"
                type="email"
                {...register('billing_email')}
                placeholder="billing@example.com"
                className={errors.billing_email ? "border-destructive" : ""}
                disabled={!isOwner || isSubmitting}
              />
              {errors.billing_email && (
                <p className="text-sm text-destructive">{errors.billing_email.message}</p>
              )}
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={selectedTimezone}
              onValueChange={(value) => setValue('timezone', value)}
              disabled={!isOwner || isSubmitting}
            >
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezoneOptions.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Used for date displays and scheduled sittings
            </p>
          </div>

          {/* Submit Button */}
          {isOwner && (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving changes...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
