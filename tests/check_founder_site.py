"""Run with python3 tests/check_founder_site.py; no dependencies required."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
PAGES = [p.name for p in ROOT.glob('*.html')
         if 'class="founder-site' in p.read_text() and p.name != '404.html']


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

    def matching(self, tag):
        return [attrs for name, attrs in self.tags if name == tag]


class FounderSite(unittest.TestCase):
    def test_local_links_assets_and_fragments(self):
        for name in PAGES:
            document = Document((ROOT / name).read_text())
            for tag, attrs in document.tags:
                target = attrs.get('href') or attrs.get('src')
                if not target:
                    continue
                url = urlsplit(target)
                if url.scheme or url.netloc:
                    continue
                path = (ROOT / unquote(url.path).lstrip('/')) if url.path else ROOT / name
                if path.is_dir():
                    path /= 'index.html'
                self.assertTrue(path.is_file(), f'{name}: {target}')
                if url.fragment and path.suffix == '.html':
                    ids = {a.get('id') for _, a in Document(path.read_text()).tags}
                    self.assertIn(url.fragment, ids, f'{name}: {target}')

    def test_semantic_page_basics(self):
        for name in PAGES:
            doc = Document((ROOT / name).read_text())
            self.assertEqual(len(doc.matching('h1')), 1, name)
            self.assertEqual(len(doc.matching('main')), 1, name)
            ids = [attrs['id'] for _, attrs in doc.tags if 'id' in attrs]
            self.assertEqual(len(ids), len(set(ids)), f'duplicate id in {name}')
            self.assertTrue(any(a.get('rel') == 'canonical' for a in doc.matching('link')), name)
            self.assertNotIn('platform-system.js', (ROOT / name).read_text(), name)
            self.assertTrue(any(a.get('class') == 'skip-link' for a in doc.matching('a')), name)
            for image in doc.matching('img'):
                self.assertIn('alt', image, name)

    def test_small_homepage_demo_surface_and_static_content(self):
        text = (ROOT / 'index.html').read_text()
        doc = Document(text)
        demos = [a['href'] for a in doc.matching('a') if a.get('href', '').startswith('demos/')]
        self.assertEqual(demos, ['demos/llm-gateway/', 'demos/rag-guardrails/'])
        self.assertIn('10 account managers', text)
        self.assertIn('Principal / Staff IC roles', text)
        self.assertIn('three months', text)
        self.assertNotIn('platform-system.js', text)
        self.assertNotIn('GraphRAG', text)
        self.assertNotIn('PyRIT', text)

    def test_mocks_and_sitemap(self):
        for direction in 'abcde':
            self.assertTrue((ROOT / f'mocks/founder-screen/{direction}.html').exists())
        tree = ET.fromstring((ROOT / 'sitemap.xml').read_text())
        urls = [e.text for e in tree.findall('.//{*}loc')]
        self.assertIn('https://www.nitishprasad.com/project-seller-incentives', urls)
        self.assertEqual(len(urls), len(set(urls)))


if __name__ == '__main__':
    unittest.main()
