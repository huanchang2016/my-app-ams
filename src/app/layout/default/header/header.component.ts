import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'layout-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .header-img-box {
      max-width: 48px;
      max-height: 48px;
      overflow: hidden;
    }
  `]
})
export class HeaderComponent {
  searchToggleStatus: boolean;

  constructor(public settings: SettingsService) {}

  toggleCollapsedSidebar() {
    this.settings.setLayout('collapsed', !this.settings.layout.collapsed);
  }

  searchToggleChange() {
    this.searchToggleStatus = !this.searchToggleStatus;
  }
}
