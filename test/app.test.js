import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM(`<!doctype html><body>
    <header id="header-container"></header><section id="hero-container"></section>
    <section id="solutions-carousel-container"></section><section id="need-finder-container"></section>
    <section id="services-container"></section><section id="workflow-container"></section>
    <section id="help-banner-container"></section><section id="cta-container"></section>
    <footer id="footer-container"></footer><div id="toast-container"></div>
</body>`, { url: 'http://localhost' });

globalThis.window = dom.window;
globalThis.document = dom.window.document;

const { AppModel } = await import('../src/models/app-model.js');
const { AppView } = await import('../src/views/app-view.js');
const { AppController } = await import('../src/controllers/app-controller.js');
const { AIService } = await import('../src/services/ai-service.js');

test('renderiza las secciones principales de la landing', () => {
    AppController.init();
    assert.ok(document.querySelector('#inicio'));
    assert.equal(document.querySelectorAll('[data-banner]').length, AppModel.featuredSolutions.length);
    assert.equal(document.querySelectorAll('#services-container article').length, AppModel.services.length);
});

test('el controlador cambia la solución activa y conserva el borrador', () => {
    document.querySelector('[data-banner="2"]').click();
    assert.equal(AppModel.state.activeBannerIndex, 2);
    assert.match(document.querySelector('#solutions-carousel-container').textContent, /sistema hecho para tu negocio/i);

    const input = document.querySelector('#idea-textarea');
    input.value = '<b>Necesito automatizar</b>';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    AppView.renderNeedFinder();
    AppController.init();
    assert.equal(document.querySelector('#idea-textarea').value, '<b>Necesito automatizar</b>');
    assert.equal(document.querySelector('#idea-textarea b'), null);
});

test('genera una propuesta local y un enlace de WhatsApp codificado', () => {
    const idea = 'Necesito una página para mi barbería llamada Barber King, con servicios, precios, ubicación, fotos, WhatsApp y colores negro y dorado.';
    const proposal = AIService.heuristicAnalysis(idea);
    const whatsappLink = AIService.getWhatsAppLink(idea, proposal, AppModel.state.whatsappNumber);

    assert.equal(proposal.businessName, 'Barber King');
    assert.match(proposal.sector, /Barbería/i);
    assert.match(decodeURIComponent(whatsappLink), /Barber King/);
    assert.match(whatsappLink, /^https:\/\/wa\.me\/573043402589\?text=/);
    assert.match(whatsappLink, /%0A/);
});

test('los selectores de solución usan la transición declarada', () => {
    assert.ok(document.querySelector('[data-banner]').classList.contains('solution-card-transition'));
});

test('renderiza correo y redes sociales sin el enlace de marca en contacto', () => {
    const emailLinks = [...document.querySelectorAll('a[href^="mailto:"]')];
    assert.ok(emailLinks.some((link) => link.getAttribute('href') === 'mailto:forge.look19@gmail.com'));

    const facebookLinks = [...document.querySelectorAll('a[href="https://www.facebook.com/profile.php?id=61594009876448"]')];
    assert.equal(facebookLinks.length, 1);
    facebookLinks.forEach((link) => {
        assert.equal(link.target, '_blank');
        assert.equal(link.rel, 'noopener noreferrer');
        assert.equal(link.getAttribute('aria-label'), 'Facebook');
    });

    assert.equal(document.querySelectorAll('#cta-container a[aria-label]').length, 0);
    assert.equal(document.querySelector('#cta-container').textContent.includes('Síguenos en:'), false);

    const footer = document.querySelector('#footer-container');
    assert.equal(footer.querySelector('img[alt="Logo de ForgeLock"]'), null);
    assert.equal(footer.querySelector('a[aria-label="Ir al inicio de ForgeLock"]'), null);
    assert.equal(footer.textContent.includes('Síguenos en'), true);
    assert.equal(footer.querySelectorAll('a[aria-label="Facebook"], a[aria-label="Instagram"], a[aria-label="X"], a[aria-label="TikTok"]').length, 4);
    footer.querySelectorAll('a[aria-label="Facebook"], a[aria-label="Instagram"], a[aria-label="X"], a[aria-label="TikTok"]').forEach((link) => {
        assert.equal(link.target, '_blank');
        assert.equal(link.rel, 'noopener noreferrer');
    });
    assert.equal(footer.querySelector('a[aria-label="Facebook"]').getAttribute('href'), 'https://www.facebook.com/profile.php?id=61594009876448');
    assert.equal(footer.querySelector('a[aria-label="Instagram"]').getAttribute('href'), 'https://www.instagram.com/forgelook/');
    assert.equal(footer.querySelector('a[aria-label="X"]').getAttribute('href'), 'https://x.com/forgelock');
    assert.equal(footer.querySelector('a[aria-label="TikTok"]').getAttribute('href'), 'https://www.tiktok.com/@forge.lock');
    assert.ok(footer.querySelector('a[href^="https://wa.me/573043402589"]'));
    assert.equal(footer.querySelector('a[aria-label="Contactar a ForgeLock por WhatsApp"]').target, '_blank');
    assert.equal(footer.querySelector('a[aria-label="Enviar correo a ForgeLock"]').getAttribute('href').startsWith('mailto:forge.look19@gmail.com'), true);
});
