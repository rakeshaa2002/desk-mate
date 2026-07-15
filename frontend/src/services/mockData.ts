export type Role = "Super Admin" | "Organization Admin" | "Member";
export type MembershipStatus = "Active" | "Expired" | "Suspended" | "Pending Approval";
export type WorkspaceStatus = "Available" | "Occupied" | "Reserved" | "Under Maintenance";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  status: MembershipStatus;
  company?: string;
  designation?: string;
  mobile?: string;
  membershipType?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
}

export interface Workspace {
  id: string;
  name: string;
  type: "Private Cabin" | "Dedicated Desk" | "Hot Desk" | "Meeting Room" | "Event Space";
  status: WorkspaceStatus;
  capacity: number;
  price: number;
  tenantId?: string;
}

export interface Tenant {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  mobile: string;
  status: "Active" | "Suspended";
  workspacesAssigned: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  user: string;
  time: string;
}

const formatDate = (date: Date) => date.toISOString().split('T')[0];
const subDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
};
const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const today = new Date();

export const mockUsers: User[] = [
  {
    id: "usr_1",
    name: "Alex Sterling",
    email: "alex@deskmate.com",
    role: "Super Admin",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?u=1",
  },
  {
    id: "usr_2",
    name: "Sarah Jenkins",
    email: "sarah@startup.io",
    role: "Member",
    status: "Active",
    company: "Startup.io",
    designation: "Frontend Engineer",
    membershipType: "Monthly Membership",
    subscriptionStart: formatDate(subDays(today, 10)),
    subscriptionEnd: formatDate(addDays(today, 20)),
    avatar: "https://i.pravatar.cc/150?u=2",
  },
  {
    id: "usr_3",
    name: "Michael Chen",
    email: "michael@expired.co",
    role: "Member",
    status: "Expired",
    company: "Expired.co",
    designation: "Freelancer",
    membershipType: "Weekly Pass",
    subscriptionStart: formatDate(subDays(today, 20)),
    subscriptionEnd: formatDate(subDays(today, 2)),
    avatar: "https://i.pravatar.cc/150?u=3",
  },
  {
    id: "usr_4",
    name: "Emily Rodriguez",
    email: "emily@techcorp.com",
    role: "Organization Admin",
    status: "Active",
    company: "Tech Corp",
    avatar: "https://i.pravatar.cc/150?u=4",
  }
];

export const mockWorkspaces: Workspace[] = [
  { id: "ws_1", name: "Cabin A", type: "Private Cabin", status: "Occupied", capacity: 4, price: 1200, tenantId: "ten_1" },
  { id: "ws_2", name: "Cabin B", type: "Private Cabin", status: "Available", capacity: 6, price: 1800 },
  { id: "ws_3", name: "Desk 101", type: "Dedicated Desk", status: "Occupied", capacity: 1, price: 300 },
  { id: "ws_4", name: "Desk 102", type: "Dedicated Desk", status: "Available", capacity: 1, price: 300 },
  { id: "ws_5", name: "Hot Desk Zone", type: "Hot Desk", status: "Available", capacity: 50, price: 150 },
  { id: "ws_6", name: "Meeting Room 1", type: "Meeting Room", status: "Reserved", capacity: 10, price: 50 },
];

export const mockTenants: Tenant[] = [
  { id: "ten_1", name: "Startup.io", contactPerson: "Sarah Jenkins", email: "contact@startup.io", mobile: "+1234567890", status: "Active", workspacesAssigned: 3 },
  { id: "ten_2", name: "Tech Corp", contactPerson: "Emily Rodriguez", email: "admin@techcorp.com", mobile: "+1987654321", status: "Active", workspacesAssigned: 8 },
];

export const mockActivities: RecentActivity[] = [
  { id: "act_1", action: "Checked in", user: "Sarah Jenkins", time: "10 mins ago" },
  { id: "act_2", action: "Booked Meeting Room 1", user: "Emily Rodriguez", time: "1 hour ago" },
  { id: "act_3", action: "Membership Renewed", user: "David Smith", time: "2 hours ago" },
  { id: "act_4", action: "Biometric Auth Failed", user: "Michael Chen", time: "3 hours ago" },
];
