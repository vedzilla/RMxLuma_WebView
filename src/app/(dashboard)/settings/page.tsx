"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Cropper, { type Area } from "react-easy-crop";
import { useSocietyAuth } from "@/hooks/useSocietyAuth";
import { mockSociety, mockProfile } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Image, Instagram, LogOut, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { DashboardPageHeader, DashboardSection } from "@/components/dashboard/DashboardMotion";

const approvalStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  trusted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

/** Draw the cropped region of an image onto a 400x400 canvas and return a JPEG Blob. */
function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  size = 400
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context unavailable"));

      ctx.drawImage(
        img,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        size,
        size
      );

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob failed"));
        },
        "image/jpeg",
        0.9
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageSrc;
  });
}

export default function SettingsPage() {
  const router = useRouter();
  const { societyId } = useParams();
  const { society, account, profile, loading } = useSocietyAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Image crop state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setName(mockProfile.name ?? "");
    setDescription(mockProfile.description ?? "");
    setImageUrl(mockProfile.image_url);
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Profile updated successfully.");
    setSaving(false);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset for next selection
    e.target.value = "";

    const objectUrl = URL.createObjectURL(file);
    setCropImage(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropDialogOpen(true);
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropConfirm = async () => {
    if (!cropImage || !croppedAreaPixels || typeof societyId !== "string")
      return;

    setUploading(true);
    try {
      const blob = await getCroppedImg(cropImage, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(blob);
      setImageUrl(previewUrl);
      toast.success("Profile image updated.");
    } catch {
      toast.error("Failed to process image.");
    } finally {
      setUploading(false);
      setCropDialogOpen(false);
      if (cropImage) URL.revokeObjectURL(cropImage);
      setCropImage(null);
    }
  };

  const handleCropCancel = () => {
    setCropDialogOpen(false);
    if (cropImage) URL.revokeObjectURL(cropImage);
    setCropImage(null);
  };

  const handleSignOut = async () => {
    router.push("/society");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your society profile and account settings
          </p>
        </div>
      </DashboardPageHeader>

      {/* Society image */}
      <DashboardSection delay={0.08}>
      <Card className="transition-all duration-[120ms] hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-base">Society Image</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={profile?.name ?? "Society"}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <Image className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg"
            className="hidden"
            onChange={handleFileSelected}
          />
          <Button
            variant="outline"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? "Uploading..." : "Upload New Image"}
          </Button>
        </CardContent>
      </Card>
      </DashboardSection>

      {/* Crop dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Profile Image</DialogTitle>
          </DialogHeader>
          <div className="relative h-64 w-full">
            {cropImage && (
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="flex items-center gap-3 px-1">
            <Label className="text-sm shrink-0">Zoom</Label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCropCancel}>
              Cancel
            </Button>
            <Button onClick={handleCropConfirm} disabled={uploading}>
              {uploading ? "Uploading..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account status */}
      <DashboardSection delay={0.16}>
      <Card className="transition-all duration-[120ms] hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-base">Account Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              Approval Status
            </span>
            <Badge
              variant="secondary"
              className={
                approvalStatusColors[account?.approval_status ?? "pending"] ??
                "bg-muted"
              }
            >
              {account?.approval_status ?? "pending"}
            </Badge>
          </div>
          {society?.instagram_handle && (
            <div className="flex items-center gap-3">
              <Instagram className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Linked Instagram:
              </span>
              <span className="text-sm font-medium">
                @{society.instagram_handle}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
      </DashboardSection>

      {/* Profile settings */}
      <DashboardSection delay={0.24}>
      <Card className="transition-all duration-[120ms] hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-base">Society Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Society Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your society name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell people about your society"
                rows={4}
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
      </DashboardSection>

      <Separator />

      {/* Reset & Sign out */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            toast.info("Reset back to Instagram — not yet implemented");
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset back to Instagram
        </Button>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
