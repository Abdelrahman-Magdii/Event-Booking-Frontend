import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, RouterLinkActive, MatButton, MatIconButton],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isScrolled = false;
  mobileMenuOpen = false;
  appName = 'EventApp';
  showCta = true;
  ctaLabel = 'Get Started';
  private authSub!: Subscription;

  navItems: {path: string, label: string}[] = [];

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.updateNavItems();
    // Subscribe to authentication state changes
    this.authSub = this.authService.isAuthenticated$.subscribe(() => {
      this.updateNavItems();
    });
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  updateNavItems() {
    if (this.authService.isAuthenticated()) {
      this.navItems = [
        { path: '/events', label: 'Events' },
      ];

      this.navItems.push({ path: '/logout', label: 'Logout' });

      // Update CTA based on auth state
      this.ctaLabel = this.authService.isAdmin() ? 'Create Event' : 'My Events';
      this.showCta = true;
    } else {
      this.navItems = [
        { path: '/events', label: 'Events' },
        { path: '/login', label: 'Login' },
        { path: '/register', label: 'Register' }
      ];
      this.ctaLabel = 'Get Started';
      this.showCta = true;
    }
  }

  onNavItemClick(path: string) {
    if (path === '/logout') {
      this.authService.logout();
      this.mobileMenuOpen = false;
    } else {
      this.mobileMenuOpen = false;
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get userInitials(): string {
    const user = this.authService.currentUserValue;
    if (user) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return '';
  }
}
