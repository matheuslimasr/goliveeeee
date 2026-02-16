import { useState, useEffect, useRef } from "react";
import { Download, Play, Trophy, Film, Wifi, Smartphone, Star, ChevronRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTrackVisit, useTrackSession, trackDownloadClick } from "@/hooks/useAnalytics";
import stadiumHero from "@/assets/stadium-hero.jpg";
import phoneMockup from "@/assets/phone-mockup.png";
import cardChampions from "@/assets/card-champions.jpg";
import cardBrasileirao from "@/assets/card-brasileirao.jpg";
import cardPremier from "@/assets/card-premier.jpg";
import cardAction from "@/assets/card-action.jpg";
import cardRomance from "@/assets/card-romance.jpg";
import cardScifi from "@/assets/card-premier.jpg";

import passo1 from "@/assets/passos/paso1.png";
import passo2 from "@/assets/passos/paso2.png";
import passo3 from "@/assets/passos/paso3.png";
import passo4 from "@/assets/passos/paso4.png";
import passo5 from "@/assets/passos/paso5.png";
import passo6 from "@/assets/passos/paso6.png";

const footballChannels = [
  { image: cardChampions, title: "Champions League", subtitle: "Ao vivo", badge: "LIVE" },
  { image: cardBrasileirao, title: "Brasileirão", subtitle: "Série A e B", badge: "HD" },
  { image: cardPremier, title: "Premier League", subtitle: "Inglaterra", badge: "4K" },
];

const movieChannels = [
  { image: cardAction, title: "Ação e Aventura", subtitle: "Estreias 2026", badge: "NEW" },
  { image: cardRomance, title: "Telenovelas", subtitle: "Grandes sucessos", badge: "TOP" },
  { image: cardScifi, title: "Futebol ao vivo", subtitle: "Assista em tempo real", badge: "HD" },
];

const Index = () => {

  const bottomRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  const [activeApkUrl, setActiveApkUrl] = useState<string | null>(null);

  // Track visit and session
  useTrackVisit();
  useTrackSession();

  useEffect(() => {
    const fetchActiveApk = async () => {
      const { data, error } = await supabase
        .from('apk_files')
        .select('file_url')
        .eq('is_active', true)
        .maybeSingle();
      
      if (data) {
        setActiveApkUrl(data.file_url);
      }
    };

    fetchActiveApk();
  }, []);

  const handleDownload = async () => {
    // Track the download click
    await trackDownloadClick();
    
    if (activeApkUrl) {
      // Create a temporary anchor element to trigger direct download
      const link = document.createElement('a');
      link.href = activeApkUrl;
      link.download = 'mastream.apk';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast({
        title: "Descarga no disponible",
        description: "La aplicación aún no está disponible para descargar. Intenta más tarde.",
        variant: "destructive"
      });
    }
  };


  // $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  function isWebView() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const lcaseUA = ua.toLowerCase();

    // Detecta WebView genérico (Android ou iOS)
    const isAndroidWebView = /\bwv\b/.test(lcaseUA) || /version\/[\d.]+.*chrome/.test(lcaseUA);
    const isiOSWebView = /(iphone|ipod|ipad).*applewebkit(?!.*safari)/i.test(lcaseUA);

    // Detecta apps específicos
    const isFacebook = /fbav|fban|fbios|fb_iab|facebook/i.test(lcaseUA);
    const isInstagram = /instagram/i.test(lcaseUA);
    const isTikTok = /tiktok/i.test(lcaseUA);

    // Se for webview ou um desses apps, retorna verdadeiro
    const result = isAndroidWebView || isiOSWebView || isFacebook || isInstagram || isTikTok;

    return {
      isWebView: result,
      source: isFacebook ? 'facebook' :
              isInstagram ? 'instagram' :
              isTikTok ? 'tiktok' :
              (isAndroidWebView || isiOSWebView ? 'generic_webview' : 'browser')
    };
  }

  function openInBrowser() {
    const url = window.location.href; // ou coloque seu link fixo
    const isAndroid = /android/i.test(navigator.userAgent);
    const isiOS = /iphone|ipod|ipad/i.test(navigator.userAgent);

    if (isAndroid) {
      // Tenta abrir diretamente no Chrome
      window.location.href = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end;`;
    } else if (isiOS) {
      // Em iOS, o melhor é apenas abrir o link padrão
      window.open(url, '_blank');
    } else {
      // fallback
      window.open(url, '_blank');
    }
  }

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  // $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY); // Pega a posição atual do scroll vertical
    };

    window.addEventListener("scroll", handleScroll);

    // Limpa o evento ao desmontar o componente
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function buttonStart(){
    const detect = isWebView();

    console.log(detect);
    if (detect.isWebView) {
      openInBrowser();
      console.log("open in browser");
    } else {
      scrollToBottom();
      console.log("scroll to bottom");
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">


      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-green">
              <Play className="w-5 h-5 text-primary-foreground fill-current" />
            </div>
            <span className="font-display text-2xl tracking-wide">GoolLive</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="hero" size="default" onClick={buttonStart}>
              <Download className="w-4 h-4" />
              Baixar Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background */}
        <div className="absolute inset-0">
          <img 
            src={stadiumHero} 
            alt="Estádio de futebol"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
          <div className="absolute inset-0 bg-grass-pattern" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 rounded-full px-5 py-2.5">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-medium text-foreground">Mais de 2 milhões de usuários</span>
              </div>
              
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.9]">
                <span className="text-gradient-green">FUTEBOL</span>
                <br />
                <span className="text-foreground">&</span>{" "}
                <span className="text-gradient-gold">FILMES</span>
                <br />
                <span className="text-muted-foreground text-3xl sm:text-4xl lg:text-5xl">NA PALMA DA SUA MÃO</span>
              </h1>
              
              <p className="text-muted-foreground text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Assista aos melhores campeonatos de futebol ao vivo e milhares de filmes em qualidade HD. 
                Tudo em um único aplicativo, 100% grátis.
              </p>

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Button variant="hero" size="xl" className="animate-pulse-green" onClick={buttonStart}>
                  <Download className="w-6 h-6" />
                  BAIXAR GRÁTIS AGORA
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-10 justify-center lg:justify-start pt-4">
                <div className="text-center">
                  <div className="font-display text-4xl text-gradient-green">500+</div>
                  <div className="text-muted-foreground text-sm mt-1">Canais</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-4xl text-gradient-gold">15K+</div>
                  <div className="text-muted-foreground text-sm mt-1">Filmes</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-4xl text-foreground">4K</div>
                  <div className="text-muted-foreground text-sm mt-1">Qualidade</div>
                </div>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="relative flex justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="relative">
                <div className="absolute -inset-20 bg-gradient-radial from-primary/30 via-transparent to-transparent rounded-full blur-3xl" />
                <img 
                  src={phoneMockup} 
                  alt="MASTREAM App"
                  className="relative z-10 w-64 sm:w-72 lg:w-80 animate-float drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Movies Section */}
      <section className="py-20 relative bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Film className="w-6 h-6 text-accent" />
                <span className="text-accent font-semibold text-sm uppercase tracking-wider">Filmes e Séries</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl">
                CATÁLOGO <span className="text-gradient-gold">EXCLUSIVO</span>
              </h2>
            </div>
            <Button variant="ghost" className="hidden sm:flex gap-1 text-muted-foreground hover:text-foreground">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {movieChannels.map((movie, index) => (
              <div 
                key={index}
                className="group relative rounded-2xl overflow-hidden card-hover cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-[4/5] relative">
                  <img 
                    src={movie.image} 
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      movie.badge === "NEW" 
                        ? "bg-primary text-primary-foreground" 
                        : movie.badge === "TOP"
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}>
                      {movie.badge}
                    </span>
                  </div>

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center shadow-glow-gold">
                      <Play className="w-7 h-7 text-accent-foreground fill-current ml-1" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-display text-2xl mb-1">{movie.title}</h3>
                    <p className="text-muted-foreground text-sm">{movie.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl sm:text-5xl mb-4">
              POR QUE <span className="text-gradient-green">NOS ESCOLHER</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              O melhor app de streaming com funções exclusivas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Trophy, title: "Futebol Premium", desc: "Todos os campeonatos nacionais e internacionais" },
              { icon: Film, title: "15.000+ Filmes", desc: "Catálogo atualizado com estreias semanais" },
              { icon: Wifi, title: "Sem travamentos", desc: "Servidores otimizados para streaming fluido" },
              { icon: Smartphone, title: "Multi-telas", desc: "Assista em até 5 dispositivos simultaneamente" },
            ].map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full h-auto" ref={bottomRef}>
        <div className="max-w-3xl mx-auto text-center mb-[30px] ">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl mb-6">
            Instalação em apenas alguns passos
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Siga estes passos simples para instalar o Golesya no seu dispositivo Android
          </p>
        </div>

        <div className="flex justify-center items-center flex-col">

            <div className="flex justify-center items-center flex-col">

            <div className="mb-[40px]">
                  <img src={passo1} className="w-[500px] h-[auto]" />
                </div>
                <div className="mb-[40px]">
                  <img src={passo2} className="w-[500px] h-[auto]" />
                </div>
                <div className="mb-[40px]">
                  <img src={passo3} className="w-[500px] h-[auto]" />
                </div>

                <div className="mb-[40px]">
                  <img src={passo4} className="w-[500px] h-[auto]" />
                </div>
                <div className="mb-[40px]">
                  <img src={passo5} className="w-[500px] h-[auto]" />
                </div>
                <div className="mb-[40px]">
                  <img src={passo6} className="w-[500px] h-[auto]" />
                </div>
              </div>

        </div>

      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[120px]" />
  
  <div className="container mx-auto px-4 relative z-10">
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl mb-6">
        BAIXE AGORA E <span className="text-gradient-green">COMECE</span>{" "}
        <span className="text-gradient-gold">A ASSISTIR</span>
      </h2>
      <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
        100% grátis. Sem anúncios irritantes. Qualidade garantida.
        Junte-se a mais de 2 milhões de usuários satisfeitos.
      </p>
      
      <Button variant="hero" size="xl" className="animate-pulse-green text-xl px-14 py-7 h-auto" onClick={handleDownload}>
        <Download className="w-7 h-7" />
        BAIXAR APP GRÁTIS
      </Button>

      <div className="flex items-center justify-center gap-6 mt-10 text-sm">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-accent fill-accent" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


      <div style={{
  backgroundColor: "hsl(224, 98%, 61%)",
  width: '100%',
  height: "auto",
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  display: scrollY >= 2039 ? "flex" : "none",
  justifyContent: "center",
  alignItems: "center",
  padding: 20
}}>
  <p className="text-[0.80em]">
    Para iniciar o download, <br /> clique no botão abaixo:&nbsp;&nbsp;&nbsp;
  </p>
  <Button variant="hero" size="default" onClick={handleDownload}>
    <Download className="w-4 h-4" />
    Baixar
  </Button>
</div>

{/* Footer */}
<footer className="py-10 border-t border-border/30">
  <div className="container mx-auto px-4">
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Play className="w-4 h-4 text-primary-foreground fill-current" />
        </div>
        <span className="font-display text-xl">MASTREAM</span>
      </div>
      <div className="flex gap-6 text-sm text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors">Termos</a>
        <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
        <a href="#" className="hover:text-foreground transition-colors">Contato</a>
      </div>
      <p className="text-sm text-muted-foreground">
        © 2024 MASTREAM. Todos os direitos reservados.
      </p>
    </div>
  </div>
</footer>


    </div>
  );
};

export default Index;
