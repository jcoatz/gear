"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Gear
          </h1>
          <p className="text-sm text-muted-foreground">{userEmail}</p>
        </div>
        <Button type="button" variant="outline" onClick={handleSignOut}>
          Sign out
        </Button>
      </header>

      {loadError ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Could not load gear: {loadError}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Your items</CardTitle>
          <CardDescription>
            Gear linked to your account (row-level security in Supabase).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No gear yet. Add your first item with the form below.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead className="min-w-[12rem] whitespace-normal">
                    Notes
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.brand ?? "—"}</TableCell>
                    <TableCell>{row.model ?? "—"}</TableCell>
                    <TableCell>{row.categories?.name ?? "—"}</TableCell>
                    <TableCell>
                      {row.condition
                        ? (CONDITION_LABELS[
                            row.condition as keyof typeof CONDITION_LABELS
                          ] ?? row.condition)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {row.weight != null ? String(row.weight) : "—"}
                    </TableCell>
                    <TableCell className="max-w-xs whitespace-normal">
                      {row.notes ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add gear</CardTitle>
          <CardDescription>
            {categories.length === 0
              ? "Add rows to the categories table in Supabase to enable the category dropdown."
              : "Save a new item to your list."}
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
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}
          </CardContent>
          <CardFooter className="justify-end border-t-0 pt-0">
            <Button type="submit" disabled={submitting || categories.length === 0}>
              {submitting ? "Saving…" : "Add item"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
