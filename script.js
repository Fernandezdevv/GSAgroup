// --- CONFIGURAÇÃO DE EFEITOS VISUAIS PARA A GSA GROUP ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. ANIMAÇÃO SUAVE DA NAVBAR (STICKY HEADER)
    const nav = document.querySelector('nav');

    const handleScrollNav = () => {
        // Se a posição de rolagem for maior que 50px (após o topo), adiciona sombra
        if (window.scrollY > 50) {
            nav.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
            nav.style.padding = '10px 0'; // Diminui o padding levemente
        } else {
            nav.style.boxShadow = 'none';
            nav.style.padding = '15px 0'; // Volta ao tamanho original
        }
    };

    window.addEventListener('scroll', handleScrollNav);
    handleScrollNav(); // Chama na inicialização para ajustar se a página já estiver rolada


    // 2. APARECER AO ROLAR (SCROLL REVEAL)
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    const observerOptions = {
        root: null, // Observa a viewport
        rootMargin: '0px',
        threshold: 0.2 // O elemento precisa estar 20% visível para disparar
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Se o elemento estiver visível, adiciona a classe 'is-visible'
                entry.target.classList.add('is-visible');
                // Para não observar mais o elemento depois de animado
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    elementsToAnimate.forEach(element => {
        // Inicialmente, os elementos são invisíveis
        element.style.opacity = '0'; 
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        
        // Adiciona a classe que fará o elemento aparecer
        scrollObserver.observe(element);
    });

    // Define a classe que dispara o efeito no CSS
    document.styleSheets[0].insertRule(
        '.is-visible { opacity: 1 !important; transform: translateY(0) !important; }', 
        document.styleSheets[0].cssRules.length
    );
});

// 3. ROLAGEM SUAVE PARA BOTÕES DA NAVBAR
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});