import { Users } from "lucide-react";
import { UserTable } from "../components/users/UserTable";
import { Badge } from "../components/ui/badge";

export default function UsersPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Users size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            User Management
            <Badge variant="indigo" className="text-xs">
              Beta
            </Badge>
          </h2>
          <p className="text-sm text-muted-foreground">
            Create, search, edit and manage user accounts
          </p>
        </div>
      </div>
      <UserTable />
    </div>
  );
}
