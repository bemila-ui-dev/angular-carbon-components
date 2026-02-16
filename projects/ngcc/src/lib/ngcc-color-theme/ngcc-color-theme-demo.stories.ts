import { Meta, StoryObj, moduleMetadata, applicationConfig } from '@storybook/angular';
import { Component } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccColorThemeSwitcher } from './ngcc-color-theme-switcher';
import { NgccColorThemeService } from './ngcc-color-theme.service';
import { NgccButton } from '../ngcc-button/ngcc-button';
import { NgccInput } from '../ngcc-input/ngcc-input-text/ngcc-input';
import { NgccInputNumber } from '../ngcc-input/ngcc-input-number/ngcc-input-number';
import { NgccCheckbox } from '../ngcc-checkbox/ngcc-checkbox';
import { NgccTooltip } from '../ngcc-tooltip/ngcc-tooltip';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { NgccTable } from '../ngcc-table/ngcc-table';
import { NgccTableColumn, NgccTableConfig } from '../ngcc-table/ngcc-table.types';
import { NgccCharts } from '../ngcc-charts/ngcc-charts';
import { NgccModal } from '../ngcc-modal/ngcc-modal';
import { NgccIconNameType } from '../ngcc-icons/icons';

// ─────────────────────────────────────────────────────────────────────────────
// User Interface
// ─────────────────────────────────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  status: string;
  lastActive: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Full Page Demo Component
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'full-page-demo',
  standalone: true,
  imports: [
    NgccColorThemeSwitcher,
    NgccButton,
    NgccInput,
    NgccInputNumber,
    NgccCheckbox,
    NgccTooltip,
    NgccIcon,
    NgccTable,
    NgccCharts,
    NgccModal,
  ],
  templateUrl: './full-page-demo.html',
  styleUrls: ['./full-page-demo.scss'],
})
class FullPageDemoComponent {
  // ─────────────────────────────────────────────────────────────────────────
  // Search & Filter State
  // ─────────────────────────────────────────────────────────────────────────

  searchQuery = '';
  userLimit = '100';
  includeInactive = false;
  includeArchived = false;

  // ─────────────────────────────────────────────────────────────────────────
  // Table Configuration
  // ─────────────────────────────────────────────────────────────────────────

  tableColumns: NgccTableColumn<User>[] = [
    { key: 'name', header: 'Name', sortable: true, width: 180 },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'department', header: 'Department', sortable: true, width: 150 },
    { key: 'status', header: 'Status', sortable: false, width: 100, align: 'center' },
    { key: 'lastActive', header: 'Last Active', sortable: true, width: 130 },
  ];

  tableData: User[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      department: 'Engineering',
      status: 'Active',
      lastActive: '2 min ago',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      department: 'Marketing',
      status: 'Active',
      lastActive: '15 min ago',
    },
    {
      id: 3,
      name: 'Bob Wilson',
      email: 'bob.wilson@example.com',
      department: 'Sales',
      status: 'Active',
      lastActive: '1 hour ago',
    },
    {
      id: 4,
      name: 'Alice Johnson',
      email: 'alice.j@example.com',
      department: 'Engineering',
      status: 'Inactive',
      lastActive: '2 days ago',
    },
    {
      id: 5,
      name: 'Charlie Brown',
      email: 'charlie.b@example.com',
      department: 'HR',
      status: 'Active',
      lastActive: '30 min ago',
    },
    {
      id: 6,
      name: 'Diana Prince',
      email: 'diana.p@example.com',
      department: 'Legal',
      status: 'Active',
      lastActive: '5 min ago',
    },
    {
      id: 7,
      name: 'Edward Norton',
      email: 'edward.n@example.com',
      department: 'Finance',
      status: 'Pending',
      lastActive: '1 week ago',
    },
    {
      id: 8,
      name: 'Fiona Green',
      email: 'fiona.g@example.com',
      department: 'Engineering',
      status: 'Active',
      lastActive: '10 min ago',
    },
  ];

  tableConfig: NgccTableConfig = {
    pagination: true,
    pageSize: 5,
    rowSelection: 'multiple',
    search: {
      enabled: true,
      mode: 'static',
    },
  };

  tableLoading = false;
  selectedRows: User[] = [];

  // ─────────────────────────────────────────────────────────────────────────
  // Chart Configuration
  // ─────────────────────────────────────────────────────────────────────────

  chartData = [
    { month: 'Jan', revenue: 45000, target: 40000 },
    { month: 'Feb', revenue: 52000, target: 45000 },
    { month: 'Mar', revenue: 48000, target: 50000 },
    { month: 'Apr', revenue: 61000, target: 55000 },
    { month: 'May', revenue: 55000, target: 58000 },
    { month: 'Jun', revenue: 67000, target: 60000 },
    { month: 'Jul', revenue: 72000, target: 65000 },
    { month: 'Aug', revenue: 69000, target: 70000 },
  ];

  chartOptions = {
    title: '',
    height: '300px',
    axes: {
      bottom: { mapsTo: 'month', scaleType: 'labels' },
      left: { mapsTo: 'revenue', scaleType: 'linear' },
    },
    curve: 'curveMonotoneX',
    points: { enabled: true },
    legend: { enabled: true, position: 'bottom' as const },
    grid: { x: { enabled: true }, y: { enabled: true } },
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Modal State
  // ─────────────────────────────────────────────────────────────────────────

  isDeleteModalOpen = false;
  isAddUserModalOpen = false;

  newUser = {
    name: '',
    email: '',
    department: '',
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Notification State
  // ─────────────────────────────────────────────────────────────────────────

  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'warning' | 'info' = 'info';
  notificationIcon: NgccIconNameType = 'info_filled';

  // ─────────────────────────────────────────────────────────────────────────
  // Header Actions
  // ─────────────────────────────────────────────────────────────────────────

  onSearchClick(): void {
    this.showToast('Search opened', 'info');
  }

  onNotificationClick(): void {
    this.showToast('You have 3 new notifications', 'info');
  }

  onSettingsClick(): void {
    this.showToast('Settings panel opened', 'info');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Stats Card Actions
  // ─────────────────────────────────────────────────────────────────────────

  onStatCardClick(statType: string): void {
    this.showToast(`Viewing ${statType} details`, 'info');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Search & Filter Actions
  // ─────────────────────────────────────────────────────────────────────────

  onSearch(): void {
    this.tableLoading = true;
    setTimeout(() => {
      const query = this.searchQuery.toLowerCase();
      if (query) {
        this.tableData = this.getOriginalData().filter(
          (user) =>
            user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
        );
        this.showToast(
          `Found ${this.tableData.length} users matching "${this.searchQuery}"`,
          'success',
        );
      } else {
        this.tableData = this.getOriginalData();
        this.showToast('Showing all users', 'info');
      }
      this.tableLoading = false;
    }, 500);
  }

  onExport(): void {
    this.showToast('Exporting user data to CSV...', 'info');
    setTimeout(() => {
      this.showToast('Export completed successfully!', 'success');
    }, 1500);
  }

  onClearFilters(): void {
    this.searchQuery = '';
    this.userLimit = '100';
    this.includeInactive = false;
    this.includeArchived = false;
    this.tableData = this.getOriginalData();
    this.showToast('Filters cleared', 'info');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Chart Actions
  // ─────────────────────────────────────────────────────────────────────────

  onExportChart(): void {
    this.showToast('Exporting chart data...', 'info');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Table Actions
  // ─────────────────────────────────────────────────────────────────────────

  onRowSelect(rows: User[]): void {
    this.selectedRows = rows;
  }

  onRefreshTable(): void {
    this.tableLoading = true;
    setTimeout(() => {
      this.tableData = this.getOriginalData();
      this.tableLoading = false;
      this.showToast('Table data refreshed', 'success');
    }, 800);
  }

  onAddUser(): void {
    this.newUser = { name: '', email: '', department: '' };
    this.isAddUserModalOpen = true;
  }

  onEditSelected(): void {
    if (this.selectedRows.length === 1) {
      this.showToast(`Editing user: ${this.selectedRows[0].name}`, 'info');
    } else {
      this.showToast(`Bulk editing ${this.selectedRows.length} users`, 'info');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Delete Modal Actions
  // ─────────────────────────────────────────────────────────────────────────

  openDeleteModal(): void {
    if (this.selectedRows.length > 0) {
      this.isDeleteModalOpen = true;
    }
  }

  onConfirmDelete(): void {
    const deletedCount = this.selectedRows.length;
    const deletedIds = this.selectedRows.map((r) => r.id);

    this.tableData = this.tableData.filter((user) => !deletedIds.includes(user.id));
    this.selectedRows = [];
    this.isDeleteModalOpen = false;

    this.showToast(`Successfully deleted ${deletedCount} user(s)`, 'success');
  }

  onDeleteModalClosed(): void {
    this.isDeleteModalOpen = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Add User Modal Actions
  // ─────────────────────────────────────────────────────────────────────────

  isNewUserFormValid(): boolean {
    return (
      this.newUser.name.trim().length > 0 &&
      this.newUser.email.trim().length > 0 &&
      this.newUser.email.includes('@')
    );
  }

  onCreateUser(): void {
    const newId = Math.max(...this.tableData.map((u) => u.id)) + 1;
    const newUser: User = {
      id: newId,
      name: this.newUser.name,
      email: this.newUser.email,
      department: this.newUser.department || 'Unassigned',
      status: 'Pending',
      lastActive: 'Just now',
    };

    this.tableData = [newUser, ...this.tableData];
    this.isAddUserModalOpen = false;
    this.newUser = { name: '', email: '', department: '' };

    this.showToast(`User "${newUser.name}" created successfully!`, 'success');
  }

  onAddUserModalClosed(): void {
    this.isAddUserModalOpen = false;
    this.newUser = { name: '', email: '', department: '' };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Notification Helpers
  // ─────────────────────────────────────────────────────────────────────────

  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.notificationIcon = this.getNotificationIcon(type);
    this.showNotification = true;

    setTimeout(() => {
      this.closeNotification();
    }, 3000);
  }

  getNotificationIcon(type: string): NgccIconNameType {
    const icons: Record<string, NgccIconNameType> = {
      success: 'success_filled',
      error: 'error_filled',
      warning: 'warning_filled',
      info: 'info_filled',
    };
    return icons[type] || 'info_filled';
  }

  closeNotification(): void {
    this.showNotification = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Data Helpers
  // ─────────────────────────────────────────────────────────────────────────

  private getOriginalData(): User[] {
    return [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        department: 'Engineering',
        status: 'Active',
        lastActive: '2 min ago',
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        department: 'Marketing',
        status: 'Active',
        lastActive: '15 min ago',
      },
      {
        id: 3,
        name: 'Bob Wilson',
        email: 'bob.wilson@example.com',
        department: 'Sales',
        status: 'Active',
        lastActive: '1 hour ago',
      },
      {
        id: 4,
        name: 'Alice Johnson',
        email: 'alice.j@example.com',
        department: 'Engineering',
        status: 'Inactive',
        lastActive: '2 days ago',
      },
      {
        id: 5,
        name: 'Charlie Brown',
        email: 'charlie.b@example.com',
        department: 'HR',
        status: 'Active',
        lastActive: '30 min ago',
      },
      {
        id: 6,
        name: 'Diana Prince',
        email: 'diana.p@example.com',
        department: 'Legal',
        status: 'Active',
        lastActive: '5 min ago',
      },
      {
        id: 7,
        name: 'Edward Norton',
        email: 'edward.n@example.com',
        department: 'Finance',
        status: 'Pending',
        lastActive: '1 week ago',
      },
      {
        id: 8,
        name: 'Fiona Green',
        email: 'fiona.g@example.com',
        department: 'Engineering',
        status: 'Active',
        lastActive: '10 min ago',
      },
    ];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Story Configuration
// ─────────────────────────────────────────────────────────────────────────────

export default {
  title: 'Demo/Enterprise Dashboard',
  decorators: [
    moduleMetadata({
      imports: [
        FullPageDemoComponent,
        NgccColorThemeSwitcher,
        NgccButton,
        NgccInput,
        NgccInputNumber,
        NgccCheckbox,
        NgccIcon,
        NgccTable,
        NgccCharts,
        NgccModal,
      ],
      providers: [NgccColorThemeService],
    }),
    applicationConfig({
      providers: [provideZonelessChangeDetection()],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Enterprise Dashboard Demo

A full-page demonstration showing all NGCC working together in an enterprise application.

## Components Used

- **NgccButton**: Primary, secondary, ghost, and danger variants with icons
- **NgccIcon**: Various icons for UI elements and status indicators
- **NgccInput**: Text and number input fields with validation
- **NgccCheckbox**: Filter checkboxes
- **NgccTable**: Sortable, selectable data table with pagination
- **NgccCharts**: Line chart showing revenue trends
- **NgccModal**: Delete confirmation and Add User modals
- **NgccColorThemeSwitcher**: Theme customization

## Features Demonstrated

- **Header with Icon Buttons**: Search, notifications, settings
- **Statistics Cards**: Clickable cards with trend indicators
- **Search & Filters**: Form inputs with action buttons
- **Data Table**: Multi-select, search, pagination, sorting
- **Line Chart**: Revenue trend visualization
- **Modal Dialogs**: Confirmation and form modals
- **Toast Notifications**: Feedback for user actions

## How to Use

1. Click stat cards to see details
2. Search users using the search field
3. Select table rows and use bulk actions
4. Click "Add User" to create new users
5. Delete selected users with confirmation modal
6. Switch themes using the sidebar
        `,
      },
    },
  },
} as Meta;

type Story = StoryObj;

export const Default: Story = {
  name: 'Full Dashboard',
  render: () => ({
    template: `<full-page-demo></full-page-demo>`,
  }),
};

export const DarkTheme: Story = {
  name: 'Dark Theme (g90)',
  render: () => ({
    template: `<full-page-demo></full-page-demo>`,
  }),
  play: async ({ canvasElement }) => {
    setTimeout(() => {
      const buttons = canvasElement.querySelectorAll('.theme-options button');
      buttons.forEach((btn: Element) => {
        if (btn.textContent?.trim() === 'g90') {
          (btn as HTMLButtonElement).click();
        }
      });
    }, 100);
  },
};

export const HighContrastDark: Story = {
  name: 'High Contrast (g100)',
  render: () => ({
    template: `<full-page-demo></full-page-demo>`,
  }),
  play: async ({ canvasElement }) => {
    setTimeout(() => {
      const buttons = canvasElement.querySelectorAll('.theme-options button');
      buttons.forEach((btn: Element) => {
        if (btn.textContent?.trim() === 'g100') {
          (btn as HTMLButtonElement).click();
        }
      });
    }, 100);
  },
};

export const LightGray: Story = {
  name: 'Light Gray (g10)',
  render: () => ({
    template: `<full-page-demo></full-page-demo>`,
  }),
  play: async ({ canvasElement }) => {
    setTimeout(() => {
      const buttons = canvasElement.querySelectorAll('.theme-options button');
      buttons.forEach((btn: Element) => {
        if (btn.textContent?.trim() === 'g10') {
          (btn as HTMLButtonElement).click();
        }
      });
    }, 100);
  },
};
