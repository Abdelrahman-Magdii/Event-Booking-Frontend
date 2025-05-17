import {Component, HostListener, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatButton, MatIconButton} from '@angular/material/button';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, RouterLinkActive, MatButton, MatIconButton],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isScrolled = false;
  mobileMenuOpen = false;
  appName = 'EventApp'; // Change this to your app name
  showCta = true;
  ctaLabel = 'Get Started';

  // Navigation items based on your routes
  navItems = [
    {path: '/events', label: 'Events'},
    {path: '/login', label: 'Login'},
    {path: '/register', label: 'Register'},
  ];

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  constructor(private authService: AuthService) {
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit() {
    this.updateNavItems();
  }

  updateNavItems() {
    if (this.isLoggedIn) {
      this.navItems = this.navItems.filter(item =>
        item.path !== '/login' && item.path !== '/register'
      );

      this.navItems.push({path: '/logout', label: 'Logout'});
    } else {
      if (!this.navItems.some(item => item.path === '/login')) {
        this.navItems.push({path: '/login', label: 'Login'});
      }
      if (!this.navItems.some(item => item.path === '/register')) {
        this.navItems.push({path: '/register', label: 'Register'});
      }
    }
  }
}
