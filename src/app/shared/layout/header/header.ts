import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../ui/button/button';

@Component({
  selector: 'layout-header',
  imports: [RouterLink, UiButton],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class LayoutHeader {}
