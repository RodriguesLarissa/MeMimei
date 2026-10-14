import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutHeader } from './shared/layout/header/header';
import { LayoutFooter } from './shared/layout/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LayoutHeader, LayoutFooter],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
