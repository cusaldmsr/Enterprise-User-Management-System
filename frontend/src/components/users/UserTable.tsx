import React, { useMemo, useState } from "react";
import { Users as UsersIcon, Plus, Edit, Trash } from "lucide-react";
import { useUsers } from "../../hooks/useApi";
import type { User } from "../../types";
import { Card, CardContent } from "../ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { UserDialog } from "./UserDialog";
import { DeleteDialog } from "./DeleteDialog";

export function UserTable() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);

  const { data, isLoading } = useUsers({ search });
  const filtered = useMemo(() => data?.data ?? [], [data]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <UsersIcon size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Users</h3>
            <p className="text-xs text-muted-foreground">
              Manage user accounts
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-55"
          />
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={14} /> New
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                          <UsersIcon
                            size={28}
                            className="text-muted-foreground/60"
                          />
                        </div>
                        <div className="text-sm font-medium">
                          No users found
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((user) => (
                    <TableRow key={user._id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            {user.profileImage ? (
                              <AvatarImage
                                src={user.profileImage}
                                alt={user.firstName}
                              />
                            ) : (
                              <AvatarFallback>
                                {(user.firstName?.[0] ?? "") +
                                  (user.lastName?.[0] ?? "")}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex flex-col">
                            <div className="text-sm font-semibold">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Joined{" "}
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="muted" className="text-xs">
                          {user.role?.name ?? "USER"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditing(user)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleting(user)}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {showCreate && (
        <UserDialog mode="create" onClose={() => setShowCreate(false)} />
      )}
      {editing && (
        <UserDialog
          mode="edit"
          user={editing}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <DeleteDialog
          user={deleting}
          isLoading={false}
          onConfirm={() => {
            /* deletion handled elsewhere */
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
