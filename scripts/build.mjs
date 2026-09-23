import {writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {profile, projects, publications, experience, labels} from '../src/content.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const external = (url, text, className = '') => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer"${className ? ` class="${className}"` : ''}>${text}<span class="external-mark" aria-hidden="true"> ↗</span></a>`;
const icon = (className, paths) => `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const moon = icon('moon', '<path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z"/>');
const sun = icon('sun', '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>');
const copy = icon('copy-icon', '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>');

function page() {
  const text = labels;
  const heading = (id, title, link = '') => `<div class="section-heading"><h2 id="${id}">${escape(title)}</h2>${link}</div>`;
  const sortedProjects = projects;
  const listControls = (id, total) => `<div class="list-controls" data-list-controls="${id}" hidden><p class="list-count" role="status" aria-live="polite" data-count-template="${escape(text.count)}">${escape(text.count.replace('{shown}', Math.min(5, total)).replace('{total}', total))}</p><div class="list-actions"><button class="more-button" type="button" data-show-more data-more-label="${escape(text.more)}" aria-controls="${id}" aria-expanded="false">${escape(text.more)}</button><button class="more-button" type="button" data-show-less aria-controls="${id}" aria-expanded="false" hidden>${escape(text.less)}</button></div></div>`;
  const projectRows = sortedProjects.map((project, index) => `<li class="research-entry project"${index >= 5 ? ' data-collapsed' : ''}>
          <p class="entry-date">${escape(project.period || '')}</p>
          <div><h3>${escape(project.title)}</h3>
            ${project.funder ? `<p class="funder">${escape(project.funder)}</p>` : ''}
            <p class="project-meta"><span class="status ${project.status}">${escape(text[project.status])}</span><span class="project-role">${escape(text[project.role])}</span><span class="grant-id">No. ${escape(project.number)}</span></p>
          </div>
        </li>`).join('\n        ');
  const paperRows = publications.map((publication, index) => `<li class="research-entry publication" lang="${escape(publication.language || 'en')}"${index >= 5 ? ' data-collapsed' : ''}>
          <p class="entry-date">${escape(publication.year)}</p>
          <div><h3 class="entry-title">${external(publication.url, `${escape(publication.title)}${publication.language === 'zh-CN' ? '<span lang="en"> (in Chinese)</span>' : ''}`)}</h3>
            <p class="authors">${publication.authors.map(name => name === profile.name || name === profile.nameChinese ? `<strong>${escape(name)}</strong>` : escape(name)).join(', ')}</p>
            <p class="venue">${escape(publication.venue)}</p>
          </div>
        </li>`).join('\n        ');
  const experienceRows = experience.map(item => `<li class="research-entry experience-entry">
          <p class="entry-date">${escape(item.period)}</p>
          <div><h3>${escape(item.institution)}</h3><p class="experience-role">${escape(item.role)}</p><p class="experience-detail">${escape(item.detail)}</p></div>
        </li>`).join('\n        ');
  const contacts = profile.emails.map((email, i) => `<div class="contact-row"><span class="contact-label">${escape(i === 0 ? text.workEmail : text.otherEmail)}</span><a class="email-address" href="mailto:${escape(email)}">${escape(email)}</a><button type="button" class="copy-button" data-copy-email="${escape(email)}" aria-label="${escape(text.copyEmail)}: ${escape(email)}">${copy}<span class="copy-label">${escape(text.copy)}</span></button></div>`).join('\n        ');

  return `<!doctype html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#ffffff">
  <meta name="description" content="Zitao Wang, Assistant Professor of Hydrogeology at Anhui University of Science and Technology. Research projects, publications and academic background.">
  <title>${escape(profile.name)} (${escape(profile.nameChinese)}) · Academic Homepage</title>
  <link rel="canonical" href="https://wangzitao21.github.io/">
  <link rel="icon" href="./assets/favicon.svg" type="image/svg+xml">
  <script>
    (() => {
      document.documentElement.classList.add('js');
      let theme;
      try { theme = localStorage.getItem('academic-homepage-theme'); } catch {}
      if (theme !== 'light' && theme !== 'dark') theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = theme;
    })();
  </script>
  <link rel="stylesheet" href="./assets/site.css">
  <script src="./assets/site.js" defer></script>
</head>
<body id="top">
  <a class="skip-link" href="#about">${escape(text.skip)}</a>
  <header class="site-header">
    <div class="wrap header-inner">
      <a class="brand" href="#top">${escape(profile.name)}</a>
      <nav class="navigation" aria-label="${escape(text.pageNav)}">
        <a href="#projects">${escape(text.navProjects)}</a>
        <a href="#publications">${escape(text.navPublications)}</a>
        <a href="#education">${escape(text.navExperience)}</a>
        <a href="#contact">${escape(text.contact)}</a>
      </nav>
      <div class="preferences">
        <button class="theme-toggle" id="theme-toggle" type="button" aria-pressed="false" aria-label="${escape(text.switchDark)}" data-light="${escape(text.light)}" data-dark="${escape(text.dark)}" data-switch-light="${escape(text.switchLight)}" data-switch-dark="${escape(text.switchDark)}">${moon}${sun}<span data-theme-label>${escape(text.dark)}</span></button>
      </div>
    </div>
  </header>
  <main class="wrap">
    <section class="introduction" id="about" aria-labelledby="name">
      <img class="avatar" src="./${escape(profile.photo)}" alt="${escape(profile.photo.endsWith('avatar-placeholder.svg') ? text.photoPlaceholder : text.portrait)}" width="180" height="180">
      <div class="intro-main">
        <div class="identity"><h1 class="name" id="name">${escape(profile.name)} ${escape(profile.nameChinese)}</h1></div>
        <p class="role">${escape(profile.role)}</p>
        <p class="affiliation">${escape(profile.department)}<br>${escape(profile.institution)}</p>
        <p class="bio">${escape(profile.introduction)}</p>
        <div class="social-links"><a href="mailto:${escape(profile.emails[0])}">${escape(text.email)}</a>${external(profile.links.scholar, 'Google Scholar')}${external(profile.links.orcid, 'ORCID')}${external(profile.links.github, 'GitHub')}</div>
      </div>
      <aside class="interests" aria-labelledby="interests-title"><h2 id="interests-title">${escape(text.interests)}</h2><ul>${profile.interests.map(interest => `<li>${escape(interest)}</li>`).join('')}</ul></aside>
    </section>
    <section class="section" id="projects" aria-labelledby="projects-title">
      ${heading('projects-title', text.projects)}
      <ul class="research-list" id="project-list" data-expandable-list>
        ${projectRows}
      </ul>
      ${listControls('project-list', projects.length)}
    </section>
    <section class="section" id="publications" aria-labelledby="publications-title">
      ${heading('publications-title', text.publications, external(profile.links.scholar, escape(text.allPublications), 'section-link'))}
      <ul class="research-list" id="publication-list" data-expandable-list>
        ${paperRows}
      </ul>
      ${listControls('publication-list', publications.length)}
    </section>
    <section class="section" id="education" aria-labelledby="education-title">
      ${heading('education-title', text.experience)}
      <ul class="research-list">
        ${experienceRows}
      </ul>
    </section>
    <section class="section contact" id="contact" aria-labelledby="contact-title">
      ${heading('contact-title', text.contact)}
      <p class="contact-intro">${escape(text.correspondence)}</p>
      <div class="contact-list">
        ${contacts}
      </div>
    </section>
  </main>
  <footer class="wrap site-footer"><div class="footer-meta"><span>© 2026 Zitao Wang</span><span>${escape(profile.updated)}</span></div><a class="back-top" href="#top">${escape(text.top)} ↑</a></footer>
  <div class="toast" id="toast" role="status" aria-live="polite" data-success="${escape(text.copied)}" data-failure="${escape(text.copyFailed)}"></div>
</body>
</html>
`.replace(/[ \t]+$/gm, '');
}

writeFileSync(resolve(root, 'index.html'), page());
console.log('Built homepage.');
