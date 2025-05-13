import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-daisy-showcase',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 gap-6">
      <section>
        <h2 class="text-2xl font-bold mb-4">Button Variants</h2>
        <div class="flex flex-wrap gap-2">
          <button class="btn">Default</button>
          <button class="btn btn-primary">Primary</button>
          <button class="btn btn-secondary">Secondary</button>
          <button class="btn btn-accent">Accent</button>
          <button class="btn btn-info">Info</button>
          <button class="btn btn-success">Success</button>
          <button class="btn btn-warning">Warning</button>
          <button class="btn btn-error">Error</button>
        </div>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-4">Button Sizes</h2>
        <div class="flex flex-wrap items-center gap-2">
          <button class="btn btn-xs">Extra Small</button>
          <button class="btn btn-sm">Small</button>
          <button class="btn">Normal</button>
          <button class="btn btn-lg">Large</button>
        </div>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-4">Alerts</h2>
        <div class="grid gap-2">
          <div class="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Info: This is an info alert.</span>
          </div>
          <div class="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Success: This is a success alert.</span>
          </div>
          <div class="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>Warning: This is a warning alert.</span>
          </div>
          <div class="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Error: This is an error alert.</span>
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-4">Badge</h2>
        <div class="flex flex-wrap gap-2">
          <span class="badge">Default</span>
          <span class="badge badge-primary">Primary</span>
          <span class="badge badge-secondary">Secondary</span>
          <span class="badge badge-accent">Accent</span>
          <span class="badge badge-outline">Outline</span>
        </div>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-4">Card</h2>
        <div class="card w-96 bg-base-100 shadow-xl">
          <figure>
            <img src="https://placehold.co/384x200" alt="Placeholder" />
          </figure>
          <div class="card-body">
            <h2 class="card-title">Card Title</h2>
            <p>This is a sample card from daisyUI. It supports images, content and actions.</p>
            <div class="card-actions justify-end">
              <button class="btn btn-primary">Action</button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-4">Progress</h2>
        <div class="flex flex-col gap-2">
          <progress class="progress progress-primary w-56" value="0" max="100"></progress>
          <progress class="progress progress-primary w-56" value="10" max="100"></progress>
          <progress class="progress progress-primary w-56" value="40" max="100"></progress>
          <progress class="progress progress-primary w-56" value="70" max="100"></progress>
          <progress class="progress progress-primary w-56" value="100" max="100"></progress>
        </div>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-4">Toggle</h2>
        <div class="flex items-center gap-2">
          <input type="checkbox" class="toggle" checked />
          <input type="checkbox" class="toggle toggle-primary" checked />
          <input type="checkbox" class="toggle toggle-secondary" checked />
          <input type="checkbox" class="toggle toggle-accent" checked />
        </div>
      </section>
    </div>
  `,
})
export class DaisyShowcaseComponent {} 