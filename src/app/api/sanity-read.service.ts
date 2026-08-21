import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import type { ProfileDoc, ProjectDoc, SiteSettingsDoc } from '../models/cms.models';

interface SanityQueryResponse {
  result?: unknown;
}

const SITE_QUERY = `*[_type == "siteSettings"][0]{
  _id, _type, name, brandHandle, emails, socialLinks[]{id, label, url, iconUrl}
}`;

const PROFILE_QUERY = `*[_type == "profile"][0]{
  _id, _type, imageUrl, role, pitch, paragraphs, focusAreas
}`;

const PROJECTS_QUERY = `*[_type == "project"] | order(sortOrder asc){
  _id, _type, slug, title, description, technologies, technologyIconUrls,
  repositoryUrl, demoUrl, imageUrl, featured, sortOrder, detail
}`;

const PROJECT_BY_ID_QUERY = `*[_type == "project" && _id == $id][0]{
  _id, _type, slug, title, description, technologies, technologyIconUrls,
  repositoryUrl, demoUrl, imageUrl, featured, sortOrder, detail
}`;

@Injectable({ providedIn: 'root' })
export class SanityReadService {
  private readonly http = inject(HttpClient);
  private readonly timeoutMs = 10000;

  private get queryUrl(): string {
    const { projectId, dataset, apiVersion } = environment.sanity;
    return `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}`;
  }

  fetchSiteSettings(): Observable<SiteSettingsDoc | null> {
    return this.query<SiteSettingsDoc | null>(SITE_QUERY);
  }

  fetchProfile(): Observable<ProfileDoc | null> {
    return this.query<ProfileDoc | null>(PROFILE_QUERY);
  }

  fetchProjects(): Observable<ProjectDoc[]> {
    return this.query<ProjectDoc[]>(PROJECTS_QUERY).pipe(map((rows) => rows ?? []));
  }

  fetchProjectById(id: string): Observable<ProjectDoc | null> {
    return this.query<ProjectDoc | null>(PROJECT_BY_ID_QUERY, { id });
  }

  private query<T>(groq: string, params?: Record<string, string>): Observable<T> {
    let httpParams = new HttpParams().set('query', groq);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        httpParams = httpParams.set(`$${key}`, JSON.stringify(value));
      }
    }

    return this.http.get<SanityQueryResponse>(this.queryUrl, { params: httpParams }).pipe(
      timeout(this.timeoutMs),
      map((response) => (response?.result as T) ?? (null as T))
    );
  }
}
