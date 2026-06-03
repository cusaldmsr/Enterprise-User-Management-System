import { useState, useRef } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
} from "lucide-react";
import { useUsers, useDeleteUser, useRoles } from "../../hooks/useApi";
import { useToast } from "../../contexts/ToastContext";
import type { User } from "../../types";
import { UserDialog } from "./UserDialog";
import { DeleteDialog } from "./DeleteDialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { Card, CardContent } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "../ui/tooltip";
import { cn } from "@/lib/utils";

const roleBadge: Record<string, "indigo" | "warning" | "success"> = {
  ADMIN: "indigo",
  MANAGER: "warning",
  USER: "success",
};

export function UserTable() {
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebounced] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActive] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const limit = 10;

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebounced(val);
      setPage(1);
    }, 400);
  };

  const { data, isLoading } = useUsers({
    page,
    limit,
    search: debouncedSearch || undefined,
    role: roleFilter || undefined,
    isActive: activeFilter || undefined,
  });
  const { data: rolesData } = useRoles();

  const users = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const deleteMutation = useDeleteUser();

  const handleDelete = async (user: User) => {
    await deleteMutation.mutateAsync(user._id);
    toast.success(
      "User deleted",
      `${user.firstName} ${user.lastName} has been removed.`,
    );
    setDeleteUser(null);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* ── Toolbar ────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              id="user-search"
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9 bg-card"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              size={14}
              className="text-muted-foreground flex-shrink-0"
            />

            <Select
              value={roleFilter}
              onValueChange={(v) => {
                setRoleFilter(v === "_all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger id="role-filter" className="w-32 bg-card">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Roles</SelectItem>
                {rolesData?.map((r) => (
                  <SelectItem key={r._id} value={r.name}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={activeFilter}
              onValueChange={(v) => {
                setActive(v === "_all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger id="status-filter" className="w-32 bg-card">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            id="create-user-btn"
            variant="gradient"
            onClick={() => setShowCreate(true)}
            className="ml-auto"
          >
            <Plus size={15} />
            New User
          </Button>
        </div>

        {/* ── Table card ─────────────────────────────────── */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <Users
                        size={36}
                        className="text-muted-foreground/30 mx-auto mb-3"
                      />
                      <p className="text-muted-foreground text-sm">
                        No users found
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const roleName =
                      (user.role as { name?: string })?.name ?? "USER";
                    const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`;
                    return (
                      <TableRow key={user._id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border-2 border-border flex-shrink-0">
                              <AvatarImage
                                src={
                                  user.profileImage ||
                                  `https://api.dicebear.com/8.x/avataaars/svg?seed=${user.firstName}`
                                }
                                alt={user.firstName}
                              />
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground text-sm">
                                {user.firstName} {user.lastName}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant={roleBadge[roleName] ?? "muted"}>
                            {roleName}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.isActive ? "success" : "muted"}
                            className="gap-1.5"
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                user.isActive
                                  ? "bg-emerald-500"
                                  : "bg-muted-foreground",
                              )}
                            />
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short", day: "numeric" },
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  id={`edit-${user._id}`}
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => setEditUser(user)}
                                  className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                >
                                  <Pencil size={14} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit user</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  id={`delete-${user._id}`}
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => setDeleteUser(user)}
                                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete user</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* ── Pagination ─────────────────────────────────── */}
          {meta && (
            <CardContent className="flex items-center justify-between py-3.5 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="text-foreground font-medium">
                  {Math.min((page - 1) * limit + 1, meta.totalRecords)}–
                  {Math.min(page * limit, meta.totalRecords)}
                </span>{" "}
                of{" "}
                <span className="text-foreground font-medium">
                  {meta.totalRecords}
                </span>{" "}
                users
              </p>

              <div className="flex items-center gap-1">
                {[
                  {
                    icon: ChevronsLeft,
                    action: () => setPage(1),
                    disabled: page === 1,
                  },
                  {
                    icon: ChevronLeft,
                    action: () => setPage((p) => p - 1),
                    disabled: page === 1,
                  },
                ].map(({ icon: Icon, action, disabled }, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    size="icon-sm"
                    onClick={action}
                    disabled={disabled}
                    className="text-muted-foreground"
                  >
                    <Icon size={14} />
                  </Button>
                ))}

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const num = start + i;
                  if (num > totalPages) return null;
                  return (
                    <Button
                      key={num}
                      variant={page === num ? "default" : "ghost"}
                      size="icon-sm"
                      onClick={() => setPage(num)}
                      className={cn(
                        "text-xs",
                        page !== num && "text-muted-foreground",
                      )}
                    >
                      {num}
                    </Button>
                  );
                })}

                {[
                  {
                    icon: ChevronRight,
                    action: () => setPage((p) => p + 1),
                    disabled: page === totalPages,
                  },
                  {
                    icon: ChevronsRight,
                    action: () => setPage(totalPages),
                    disabled: page === totalPages,
                  },
                ].map(({ icon: Icon, action, disabled }, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    size="icon-sm"
                    onClick={action}
                    disabled={disabled}
                    className="text-muted-foreground"
                  >
                    <Icon size={14} />
                  </Button>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Dialogs */}
        {showCreate && (
          <UserDialog mode="create" onClose={() => setShowCreate(false)} />
        )}
        {editUser && (
          <UserDialog
            mode="edit"
            user={editUser}
            onClose={() => setEditUser(null)}
          />
        )}
        {deleteUser && (
          <DeleteDialog
            user={deleteUser}
            isLoading={deleteMutation.isPending}
            onConfirm={() => handleDelete(deleteUser)}
            onClose={() => setDeleteUser(null)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
