import { Routes } from '@angular/router';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/customer-home.component').then(
        (c) => c.CustomerHomeComponent,
      ),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./pages/search/service-search.component').then(
        (c) => c.ServiceSearchComponent,
      ),
  },
  {
    path: 'bookings',
    loadComponent: () =>
      import('./pages/bookings/customer-bookings.component').then(
        (c) => c.CustomerBookingsComponent,
      ),
  },
  {
    path: 'bookings/:id',
    loadComponent: () =>
      import('./pages/booking-detail/booking-detail.component').then(
        (c) => c.BookingDetailComponent,
      ),
  },
  {
    path: 'chat/:bookingId',
    loadComponent: () =>
      import('./pages/chat/chat-room.component').then(
        (c) => c.ChatRoomComponent,
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/customer-profile.component').then(
        (c) => c.CustomerProfileComponent,
      ),
  },
];
