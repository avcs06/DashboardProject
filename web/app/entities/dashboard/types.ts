export type Dashboard = {
  id: string;
  createdAt: string;
  updatedAt: string;
  dashboardName: string;
};

/** What a create takes: everything but the fields the store sets. */
export type DashboardInput = Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>;
