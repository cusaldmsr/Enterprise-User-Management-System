import { useState } from "react";
import { UserPlus, UserCog, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateUser, useUpdateUser, useRoles } from "../../hooks/useApi";
import { useToast } from "../../contexts/ToastContext";
import type { User } from "../../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Alert, AlertDescription } from "../ui/alert";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";

const baseSchema = {
  firstName: z.string().min(2, "Min 2 characters"),
  lastName: z.string().min(2, "Min 2 characters"),
  email: z.string().email("Invalid email address"),
  roleId: z.string().min(1, "Please select a role"),
  isActive: z.boolean().optional(),
};

const createSchema = z.object({
  ...baseSchema,
  password: z.string().min(6, "Min 6 characters"),
});
const editSchema = z.object({
  ...baseSchema,
  firstName: baseSchema.firstName.optional(),
  lastName: baseSchema.lastName.optional(),
  email: baseSchema.email.optional(),
  roleId: baseSchema.roleId.optional(),
  password: z.union([z.string().min(6), z.literal("")]).optional(),
});

type CreateForm = z.infer<typeof createSchema>;
type EditForm = z.infer<typeof editSchema>;

interface Props {
  mode: "create" | "edit";
  user?: User;
  onClose: () => void;
}

function FormField({
  label,
  error,
  children,
  required,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function UserDialog({ mode, user, onClose }: Props) {
  const toast = useToast();
  const [showPass, setShowPass] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { data: roles } = useRoles();

  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm | EditForm>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues:
      isEdit && user
        ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            roleId: (user.role as { _id?: string })?._id ?? "",
            isActive: user.isActive,
            password: "",
          }
        : { isActive: true },
  });

  const isActiveValue = watch("isActive");
  const roleIdValue = watch("roleId");

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const onSubmit = async (data: CreateForm | EditForm) => {
    setSubmitError("");
    try {
      if (isEdit) {
        const payload = { ...data };
        if (!payload.password) delete payload.password;
        await updateMutation.mutateAsync({ id: user!._id, payload });
        toast.success("User updated", "Changes saved successfully.");
      } else {
        await createMutation.mutateAsync(
          data as Parameters<typeof createMutation.mutateAsync>[0],
        );
        toast.success("User created", `${data.firstName} has been added.`);
      }
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Something went wrong";
      setSubmitError(msg);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-4 mb-2">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                isEdit ? "bg-amber-500/15" : "bg-primary/15",
              )}
            >
              {isEdit ? (
                <UserCog size={18} className="text-amber-500" />
              ) : (
                <UserPlus size={18} className="text-primary" />
              )}
            </div>
            <div>
              <DialogTitle>
                {isEdit ? "Edit User" : "Create New User"}
              </DialogTitle>
              <DialogDescription>
                {isEdit
                  ? "Update user information"
                  : "Fill in the details to add a new user"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="First Name"
              error={errors.firstName?.message}
              required
            >
              <Input
                {...register("firstName")}
                placeholder="John"
                className="bg-muted/50"
              />
            </FormField>
            <FormField
              label="Last Name"
              error={errors.lastName?.message}
              required
            >
              <Input
                {...register("lastName")}
                placeholder="Doe"
                className="bg-muted/50"
              />
            </FormField>
          </div>

          <FormField
            label="Email Address"
            error={errors.email?.message}
            required
          >
            <Input
              {...register("email")}
              type="email"
              placeholder="john@example.com"
              className="bg-muted/50"
            />
          </FormField>

          <FormField
            label={isEdit ? "New Password (leave blank to keep)" : "Password"}
            error={errors.password?.message}
            required={!isEdit}
          >
            <div className="relative">
              <Input
                {...register("password")}
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                className="pr-11 bg-muted/50"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground h-7 w-7"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </Button>
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Role" error={errors.roleId?.message} required>
              <Select
                value={roleIdValue ?? ""}
                onValueChange={(v) =>
                  setValue("roleId", v, { shouldValidate: true })
                }
              >
                <SelectTrigger className="bg-muted/50">
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((r) => (
                    <SelectItem key={r._id} value={r._id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Account Status">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/50 border border-input h-10">
                <Switch
                  id="isActive"
                  checked={isActiveValue ?? true}
                  onCheckedChange={(v) => setValue("isActive", v)}
                />
                <Label
                  htmlFor="isActive"
                  className="text-sm text-foreground cursor-pointer"
                >
                  {isActiveValue ? "Active" : "Inactive"}
                </Label>
              </div>
            </FormField>
          </div>

          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <Separator />

          <DialogFooter className="gap-2 pt-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              id="submit-user-btn"
              variant="gradient"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
