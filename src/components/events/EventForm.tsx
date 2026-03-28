"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleBuilder, type ScheduleEntry } from "@/components/events/ScheduleBuilder";
import { ImageUploader } from "@/components/events/ImageUploader";
import { CategorySelector } from "@/components/events/CategorySelector";
import { AlertTriangle, Loader2 } from "lucide-react";
import { APIProvider } from "@vis.gl/react-google-maps";
import type { Category } from "@/supabase_lib/types";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryIds: z.array(z.string()).min(1, "Select at least 1 category").max(3, "Select up to 3 categories"),
  schedules: z
    .array(
      z.object({
        date: z.string().min(1, "Date is required"),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string(),
        buildingName: z.string(),
        buildingId: z.string().optional(),
        buildingGoogleMapsUrl: z.string().nullish(),
        roomName: z.string(),
        roomId: z.string().optional(),
        description: z.string(),
      })
    )
    .min(1, "Add at least one schedule entry"),
  isOnline: z.boolean(),
  isFree: z.boolean(),
  price: z.string().max(100, "Price description must be under 100 characters").optional(),
  registrationUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

export type EventFormData = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  initialData?: {
    title: string;
    description: string;
    categoryIds: string[];
    schedules: ScheduleEntry[];
    isOnline: boolean;
    isFree: boolean;
    price?: string;
    registrationUrl?: string;
    images?: File[];
  };
  isScraped?: boolean;
  onSubmit: (data: EventFormData & { images: File[] }) => Promise<void>;
  submitLabel?: string;
  categories: Category[];
  categoriesLoading?: boolean;
}

const defaultSchedule: ScheduleEntry = {
  date: "",
  startTime: "",
  endTime: "",
  buildingName: "",
  roomName: "",
  description: "",
};

export function EventForm({
  initialData,
  isScraped,
  onSubmit,
  submitLabel = "Create Event",
  categories,
  categoriesLoading,
}: EventFormProps) {
  const [images, setImages] = useState<File[]>(initialData?.images ?? []);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      categoryIds: initialData?.categoryIds ?? [],
      schedules: initialData?.schedules ?? [{ ...defaultSchedule }],
      isOnline: initialData?.isOnline ?? false,
      isFree: initialData?.isFree ?? true,
      price: initialData?.price ?? "",
      registrationUrl: initialData?.registrationUrl ?? "",
    },
  });

  const isFree = watch("isFree");

  async function handleFormSubmit(data: EventFormData) {
    setSubmitting(true);
    try {
      await onSubmit({ ...data, images });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {isScraped && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            This event was scraped from Instagram. Your edits will override the
            scraped data.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Event title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the event..."
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Categories</Label>
            <Controller
              name="categoryIds"
              control={control}
              render={({ field }) => (
                <CategorySelector value={field.value} onChange={field.onChange} categories={categories} loading={categoriesLoading} />
              )}
            />
            {errors.categoryIds && (
              <p className="text-sm text-destructive">{errors.categoryIds.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="schedules"
            control={control}
            render={({ field }) => (
              <ScheduleBuilder value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.schedules && (
            <p className="mt-2 text-sm text-destructive">
              {errors.schedules.message ??
                errors.schedules.root?.message ??
                "Please fix schedule errors"}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="isOnline">Online event</Label>
            <Controller
              name="isOnline"
              control={control}
              render={({ field }) => (
                <Switch
                  id="isOnline"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="isFree">Free event</Label>
            <Controller
              name="isFree"
              control={control}
              render={({ field }) => (
                <Switch
                  id="isFree"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {!isFree && (
            <div className="space-y-1.5">
              <Label htmlFor="price">Price</Label>
              <p className="text-sm text-muted-foreground">Describe the price — not just a number</p>
              <Input
                id="price"
                placeholder="e.g. £4 at the door"
                maxLength={100}
                {...register("price")}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>
          )}

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="registrationUrl">Registration URL</Label>
            <Input
              id="registrationUrl"
              type="url"
              placeholder="https://..."
              {...register("registrationUrl")}
            />
            {errors.registrationUrl && (
              <p className="text-sm text-destructive">
                {errors.registrationUrl.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader images={images} onChange={setImages} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
    </APIProvider>
  );
}
