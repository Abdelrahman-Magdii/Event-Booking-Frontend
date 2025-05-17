import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButton],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  @Input() companyName: string = 'MyCompany';
  @Input() year: number = new Date().getFullYear();
  @Input() socialLinks = [
    { icon: 'facebook', url: '#' },
    { icon: 'twitter', url: '#' },
    { icon: 'linkedin', url: '#' },
    { icon: 'instagram', url: '#' }
  ];
  @Input() footerLinks = [
    { label: 'Privacy Policy', url: '#' },
    { label: 'Terms of Service', url: '#' },
    { label: 'Contact Us', url: '#' }
  ];
  @Input() showNewsletter: boolean = true;
}
