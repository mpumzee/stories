import { Component, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgIf } from '@angular/common';
import { marked } from 'marked';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  loading: boolean = false;
  title = 'stories';
  storyText: string = '';
  storyHtml: SafeHtml = '';

  // Dropdown values
  genre: string = 'fantasy';
  ageGroup: string = 'children';
  length: string = 'short';

  private apiUrl = 'http://localhost:5268/load'; // Update if hosted elsewhere

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}
  ngOnInit() {}

  async buildPromptAndFetch() {
    const prompt = `Generate story according to Genre: ${this.genre}, Age Group: ${this.ageGroup}, Length: ${this.length}`;
    await this.fetchStoryText(prompt);
  }

  async fetchStoryText(prompt: string) {
    this.loading = true;
    try {
      const response = await firstValueFrom(
        this.http.post(this.apiUrl + '?prompt=' + encodeURIComponent(prompt), null, {
          responseType: 'text'
        })
      );

      // Parse and extract text as before
      let jsonData: any;
      try {
        jsonData = JSON.parse(response);
      } catch {
        jsonData = response;
      }
      if (typeof jsonData === 'string') {
        jsonData = JSON.parse(jsonData);
      }
      this.storyText = jsonData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      // Convert markdown to HTML and sanitize
      this.storyHtml = this.sanitizer.bypassSecurityTrustHtml(marked.parse(this.storyText) as string);
      this.loading = false;
    } catch (error) {
      console.error('Error fetching story text:', error);
      this.storyText = 'An error occurred.';
      this.loading = false;
    }
  }

}
