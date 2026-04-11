"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Backpack,
  LogOut,
  Package,
  Plus,
  Scale,
  Tag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { addGearItem } from "./actions";
import {
  CONDITION_LABELS,
  GEAR_CONDITIONS,
  type GearItemFormValues,
  gearItemFormSchema,
} from "./schema";

export type CategoryRow = { id: string; name: string };

export type GearItemRow = {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  condition: string | null;
  weight: number | null;
  notes: string | null;
  category_id: string | null;
  categories: { name: string } | null;
};

type GearClientProps = {
  userEmail: string;
  categories: CategoryRow[];
  items: GearItemRow[];
  loadError?: string;
};

const CONDITION_COLORS: Record<string, string> = {
  new: "bg-emerald-100 text-emerald-800",
  like_new: "bg-teal-100 text-teal-800",
  good: "bg-sky-100 text-sky-800",
  fair: "bg-amber-100 text-amber-800",
  poor: "bg-red-100 text-red-800",
};

export function GearClient({
  userEmail,
  categories,
  items,
  loadError,
}: GearClientProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const defaultValues = useMemo<GearItemFormValues>(
    () => ({
      name: "",
      brand: "",
      model: "",
      category_id: categories[0]?.id ?? "",
      condition: "good",
      weight: "",
      notes: "",
    }),
    [categories],
  );

  const form = useForm<GearItemFormValues>({
    resolver: zodResolver(gearItemFormSchema),
    defaultValues,
  });

  const categoryItems = useMemo(
    () =>
      Object.fromEntries(categories.map((c) => [c.id, c.name])) as Record<
        string,
        string
      >,
    [categories],
  );

  const conditionItems = useMemo(
    () =>
      Object.fromEntries(
        GEAR_CONDITIONS.map((c) => [c, CONDITION_LABELS[c]]),
      ) as Record<string, string>,
    [],
  );

  const totalWeight = useMemo(
    () =>
      items.reduce((sum, item) => sum + (item.weight ?? 0), 0),
    [items],
  );

  const categoryCount = useMemo(
    () => new Set(items.map((i) => i.categories?.name).filter(Boolean)).size,
    [items],
  );

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Backpack size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              My Gear
            </h1>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut size={16} className="mr-1.5" />
          Sign out
        </Button>
      </header>

      {loadError ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Could not load gear: {loadError}
        </p>
      ) : null}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package size={18} />
          </div>
          <div>
            <p className="text-2xl font-semibold leading-none">{items.length}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Items</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
            <Scale size={18} />
          </div>
          <div>
            <p className="text-2xl font-semibold leading-none">
              {totalWeight > 0 ? totalWeight.toFixed(1) : "0"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Total kg</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
            <Tag size={18} />
          </div>
          <div>
            <p className="text-2xl font-semibold leading-none">{categoryCount}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Categories</p>
          </div>
        </div>
      </div>

      {/* Gear items grid */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card/50 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Backpack size={28} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No gear yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first item with the form below to get started.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((row) => (
            <div
              key={row.id}
              className="group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold leading-snug">{row.name}</p>
                  {(row.brand || row.model) ? (
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {[row.brand, row.model].filter(Boolean).join(" ")}
                    </p>
                  ) : null}
                </div>
                {row.condition ? (
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${CONDITION_COLORS[row.condition] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {CONDITION_LABELS[
                      row.condition as keyof typeof CONDITION_LABELS
                    ] ?? row.condition}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {row.categories?.name ? (
                  <span className="flex items-center gap-1">
                    <Tag size={13} />
                    {row.categories.name}
                  </span>
                ) : null}
                {row.weight != null ? (
                  <span className="flex items-center gap-1">
                    <Scale size={13} />
                    {row.weight} kg
                  </span>
                ) : null}
              </div>

              {row.notes ? (
                <p className="line-clamp-2 text-sm text-muted-foreground/80">
                  {row.notes}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Add gear form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus size={18} />
            Add gear
          </CardTitle>
          <CardDescription>
            {categories.length === 0
              ? "Add rows to the categories table in Supabase to enable the category dropdown."
              : "Save a new item to your inventory."}
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            setFormError(null);
            setSubmitting(true);
            try {
              const result = await addGearItem(values);
              if (!result.ok) {
                setFormError(result.message);
                return;
              }
              form.reset({
                ...defaultValues,
                category_id: values.category_id,
                condition: values.condition,
              });
              router.refresh();
            } finally {
              setSubmitting(false);
            }
          })}
        >
          <CardContent className="space-y-2">
            <FieldSet>
              <FieldLegend>Details</FieldLegend>
              <FieldGroup className="gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!form.formState.errors.name}>
                  <FieldLabel htmlFor="gear-name">Name</FieldLabel>
                  <FieldContent>
                    <Input
                      id="gear-name"
                      autoComplete="off"
                      aria-invalid={!!form.formState.errors.name}
                      {...form.register("name")}
                    />
                    <FieldError errors={[form.formState.errors.name]} />
                  </FieldContent>
                </Field>

                <Field data-invalid={!!form.formState.errors.brand}>
                  <FieldLabel htmlFor="gear-brand">Brand</FieldLabel>
                  <FieldContent>
                    <Input
                      id="gear-brand"
                      autoComplete="off"
                      aria-invalid={!!form.formState.errors.brand}
                      {...form.register("brand")}
                    />
                    <FieldError errors={[form.formState.errors.brand]} />
                  </FieldContent>
                </Field>

                <Field data-invalid={!!form.formState.errors.model}>
                  <FieldLabel htmlFor="gear-model">Model</FieldLabel>
                  <FieldContent>
                    <Input
                      id="gear-model"
                      autoComplete="off"
                      aria-invalid={!!form.formState.errors.model}
                      {...form.register("model")}
                    />
                    <FieldError errors={[form.formState.errors.model]} />
                  </FieldContent>
                </Field>

                <Field data-invalid={!!form.formState.errors.category_id}>
                  <FieldLabel>Category</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={form.control}
                      name="category_id"
                      render={({ field, fieldState }) => (
                        <Select
                          disabled={categories.length === 0}
                          value={field.value || null}
                          onValueChange={(v) => field.onChange(v ?? "")}
                          items={categoryItems}
                        >
                          <SelectTrigger
                            className="w-full"
                            aria-invalid={fieldState.invalid}
                          >
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={[form.formState.errors.category_id]} />
                  </FieldContent>
                </Field>

                <Field data-invalid={!!form.formState.errors.condition}>
                  <FieldLabel>Condition</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={form.control}
                      name="condition"
                      render={({ field, fieldState }) => (
                        <Select
                          value={field.value}
                          onValueChange={(v) =>
                            field.onChange(
                              (v ?? "good") as GearItemFormValues["condition"],
                            )
                          }
                          items={conditionItems}
                        >
                          <SelectTrigger
                            className="w-full"
                            aria-invalid={fieldState.invalid}
                          >
                            <SelectValue placeholder="Condition" />
                          </SelectTrigger>
                          <SelectContent>
                            {GEAR_CONDITIONS.map((c) => (
                              <SelectItem key={c} value={c}>
                                {CONDITION_LABELS[c]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={[form.formState.errors.condition]} />
                  </FieldContent>
                </Field>

                <Field data-invalid={!!form.formState.errors.weight}>
                  <FieldLabel htmlFor="gear-weight">Weight</FieldLabel>
                  <FieldContent>
                    <Input
                      id="gear-weight"
                      inputMode="decimal"
                      placeholder="e.g. 2.5 (kg)"
                      aria-invalid={!!form.formState.errors.weight}
                      {...form.register("weight")}
                    />
                    <FieldError errors={[form.formState.errors.weight]} />
                  </FieldContent>
                </Field>
                </div>
              </FieldGroup>

              <Field data-invalid={!!form.formState.errors.notes}>
                <FieldLabel htmlFor="gear-notes">Notes</FieldLabel>
                <FieldContent>
                  <Textarea
                    id="gear-notes"
                    rows={3}
                    className="min-h-0"
                    aria-invalid={!!form.formState.errors.notes}
                    {...form.register("notes")}
                  />
                  <FieldError errors={[form.formState.errors.notes]} />
                </FieldContent>
              </Field>
            </FieldSet>

            {formError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}
          </CardContent>
          <CardFooter className="justify-end border-t-0 pt-0">
            <Button type="submit" disabled={submitting || categories.length === 0}>
              {submitting ? "Saving..." : "Add item"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
