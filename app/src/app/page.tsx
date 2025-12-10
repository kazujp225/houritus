/**
 * トップページ（公開LP）
 *
 * 検索から最初にアクセスするページ
 * 相談者向けのランディングページ
 *
 * 非弁対策：
 * - サービス提供主体は弁護士法人柳田を明記
 * - AIは補助ツールであることを明示
 * - 個別判断（「あなたは破産が最適」等）は表示しない
 * - 一般的な制度説明に限定
 */

import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-surface selection:bg-accent selection:text-white">
      <div className="texture-overlay" />

      {/* Navigation */}
      <nav className="fixed w-full z-50 glass transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-gold rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-serif font-bold text-primary tracking-wide">
                  柳田法律事務所
                </span>
                <span className="hidden md:inline text-xs text-slate-500 ml-2">弁護士法人</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="tel:0120-XXX-XXX" className="hidden md:flex items-center text-sm text-primary/70 hover:text-primary transition-colors">
                <svg className="w-4 h-4 mr-2 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                0120-XXX-XXX
              </a>
              <Link
                href="/login"
                className="px-5 py-2 rounded-full border border-primary/10 text-primary text-sm font-medium hover:bg-primary hover:text-white transition-all duration-300"
              >
                依頼者ログイン
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/hero-bg.png"
            alt="Abstract Law Background"
            fill
            className="object-cover opacity-15 animate-breathe"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface/95 via-surface/80 to-surface pointer-events-none" />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float delay-200" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <ScrollReveal>
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm mb-6">
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  弁護士法人による法律相談
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary leading-tight mb-6">
                  <span className="text-gradient-gold">借金問題</span>でお悩みの方へ<br />
                  <span className="text-2xl md:text-3xl lg:text-4xl">弁護士が解決をサポートします</span>
                </h1>

                <p className="text-base md:text-lg text-slate-600 mb-6 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  柳田法律事務所は、自己破産・個人再生・任意整理など、債務整理の手続きを専門的にサポートする弁護士法人です。
                </p>

                {/* Important Notice */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 text-left max-w-xl mx-auto lg:mx-0">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-slate-600">
                      <p className="font-medium text-primary mb-1">ご相談について</p>
                      <ul className="space-y-1 text-xs">
                        <li>・ご相談は受任を保証するものではありません</li>
                        <li>・法的助言は弁護士との面談後に行います</li>
                        <li>・最適な手続きは弁護士が判断いたします</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/consult"
                    className="group relative px-8 py-4 bg-gradient-gold text-primary font-bold text-lg rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover-lift"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      無料相談を予約する
                      <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Link>

                  <a
                    href="tel:0120-XXX-XXX"
                    className="px-8 py-4 rounded-xl border-2 border-primary/20 text-primary font-medium hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 flex items-center justify-center hover-lift"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    0120-XXX-XXX
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="mt-8 flex flex-wrap items-center gap-4 justify-center lg:justify-start text-sm text-slate-500">
                  <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>初回相談無料</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>秘密厳守</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>オンライン相談可</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right Content - Service Info Card */}
            <ScrollReveal className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-gold rounded-3xl blur-2xl opacity-20 transform rotate-3" />
                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-primary">弁護士法人 柳田法律事務所</h3>
                    <p className="text-sm text-slate-500 mt-1">債務整理・破産手続の専門事務所</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-4 p-3 bg-surface/50 rounded-xl">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-primary">経験豊富な弁護士が対応</div>
                        <div className="text-xs text-slate-500">債務整理の実績多数</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-surface/50 rounded-xl">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-primary">弁護士守秘義務により保護</div>
                        <div className="text-xs text-slate-500">ご相談内容は厳守いたします</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-surface/50 rounded-xl">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-primary">書類作成を弁護士がサポート</div>
                        <div className="text-xs text-slate-500">申立書類の作成もお任せください</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 text-center">
                    <p className="text-xs text-slate-500">
                      弁護士登録番号：XXXXX号<br />
                      東京弁護士会所属
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Mobile Trust Bar */}
      <section className="lg:hidden py-6 bg-primary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-3">
            <p className="text-accent text-sm font-medium">弁護士法人 柳田法律事務所</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/10 rounded-lg py-2">
              <div className="text-accent text-xs">初回相談</div>
              <div className="text-white font-bold">無料</div>
            </div>
            <div className="bg-white/10 rounded-lg py-2">
              <div className="text-accent text-xs">相談</div>
              <div className="text-white font-bold">秘密厳守</div>
            </div>
            <div className="bg-white/10 rounded-lg py-2">
              <div className="text-accent text-xs">オンライン</div>
              <div className="text-white font-bold">対応可</div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Handle Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)', backgroundSize: '40px 40px'}} />
        </div>

        <ScrollReveal className="max-w-7xl mx-auto px-6 relative z-10" threshold={0.1}>
          <div className="text-center mb-12">
            <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent text-xs tracking-widest uppercase mb-4">
              Services
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-4">
              このようなお悩みをお持ちの方へ
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base">
              借金問題は一人で抱え込まず、法律の専門家にご相談ください。弁護士が状況を伺い、適切な解決方法をご提案いたします。
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { text: "借金の返済が困難になった", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
              { text: "督促の電話や手紙が届く", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
              { text: "住宅ローンの支払いが厳しい", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
              { text: "給与の差押えを受けた", icon: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-surface/50 rounded-xl border border-slate-100 hover:border-accent/30 transition-colors">
                <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <span className="text-sm text-primary font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-primary mb-2">弁護士からのメッセージ</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  借金問題は早めにご相談いただくことで、より多くの選択肢をご提案できます。一般に、債務整理には自己破産、個人再生、任意整理などの方法があります。どの手続きが適切かは、ご状況を詳しくお伺いした上で弁護士が判断いたします。まずはお気軽にご相談ください。
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Solutions Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />

        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-accent-light text-xs tracking-widest uppercase mb-4">
                Debt Solutions
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
                債務整理の主な方法
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm">
                一般的に利用される債務整理の方法をご紹介します。<br className="hidden md:block" />
                お客様の状況に応じて、弁護士が最適な方法を判断いたします。
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "任意整理",
                subtitle: "Voluntary Arrangement",
                desc: "裁判所を通さず、弁護士が債権者と直接交渉し、将来利息のカットや返済期間の見直しを行う方法です。",
                points: ["裁判所への申立不要", "将来利息のカット交渉", "返済計画の見直し"],
                note: "※交渉結果は債権者との合意によります"
              },
              {
                title: "個人再生",
                subtitle: "Civil Rehabilitation",
                desc: "裁判所に申立てを行い、借金を大幅に減額した上で、原則3年間で返済する計画を立てる方法です。",
                points: ["借金の大幅な減額が可能", "住宅を残せる場合あり", "裁判所の認可が必要"],
                note: "※要件を満たす必要があります",
                highlight: true
              },
              {
                title: "自己破産",
                subtitle: "Personal Bankruptcy",
                desc: "裁判所に申立てを行い、免責許可決定を受けることで、借金の支払義務を免除してもらう方法です。",
                points: ["借金の支払義務が免除", "生活の再出発が可能", "一定の財産は維持可能"],
                note: "※免責不許可事由がある場合を除く"
              }
            ].map((item, i) => (
              <ScrollReveal key={i}>
                <div className={`relative group h-full ${item.highlight ? 'md:-mt-4 md:mb-4' : ''}`}>
                  {item.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <span className="bg-accent text-primary text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                        住宅を残せる可能性
                      </span>
                    </div>
                  )}
                  <div className={`h-full bg-white/10 backdrop-blur-sm border ${item.highlight ? 'border-accent/50 bg-white/15' : 'border-white/10'} p-6 rounded-2xl hover:bg-white/15 transition-all duration-300`}>
                    <div className="text-accent text-xs tracking-wider uppercase mb-2">{item.subtitle}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                      {item.desc}
                    </p>
                    <ul className="space-y-2 mb-4">
                      {item.points.map((point, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                          <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {point}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-slate-500">{item.note}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              ※上記は一般的な説明です。個別の事情により適用が異なりますので、詳しくは弁護士にご相談ください。
            </p>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-surface relative overflow-hidden">
        <ScrollReveal className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent text-xs tracking-widest uppercase mb-4">
              Flow
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-4">
              ご相談から解決までの流れ
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-sm">
              まずは無料相談から始めましょう。弁護士が丁寧にお話を伺います。
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "無料相談のご予約",
                desc: "お電話またはWebフォームから、ご相談の予約をお取りください。ご都合の良い日時をお選びいただけます。",
                note: "電話・オンライン相談も可能です"
              },
              {
                step: "02",
                title: "弁護士との面談",
                desc: "弁護士が直接お話を伺い、借入状況、収入、生活状況などを確認します。ご質問にも丁寧にお答えします。",
                note: "秘密は厳守いたします"
              },
              {
                step: "03",
                title: "方針のご説明・ご依頼",
                desc: "弁護士が最適な解決方法と今後の流れをご説明します。ご納得いただけましたら、委任契約を締結します。",
                note: "費用についても事前にご説明します"
              },
              {
                step: "04",
                title: "弁護士による手続き",
                desc: "受任通知の送付、書類の作成、裁判所への申立てなど、必要な手続きを弁護士が代行します。",
                note: "依頼者様の負担を軽減します"
              }
            ].map((flow, i) => (
              <div key={i} className="flex gap-4 md:gap-6 p-4 md:p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-primary rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-accent font-bold text-lg md:text-xl">{flow.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-primary mb-1">{flow.title}</h3>
                  <p className="text-slate-600 text-sm mb-2">{flow.desc}</p>
                  <p className="text-xs text-accent">{flow.note}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <ScrollReveal className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent text-xs tracking-widest uppercase mb-4">
              FAQ
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-4">
              よくあるご質問
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "相談は本当に無料ですか？",
                a: "はい、初回のご相談は無料です。まずはお気軽にご相談ください。ご依頼いただく場合の費用は、面談時に詳しくご説明いたします。"
              },
              {
                q: "家族や職場に知られずに手続きできますか？",
                a: "弁護士には守秘義務がありますので、ご相談内容が外部に漏れることはありません。ただし、手続きの種類によっては通知が届く場合がありますので、詳しくは面談時にご説明します。"
              },
              {
                q: "どの手続きが自分に合っているか分かりません",
                a: "ご心配いりません。借入状況、収入、生活状況などを弁護士が丁寧にお伺いし、お客様に最適な方法をご提案いたします。"
              },
              {
                q: "相談したら必ず依頼しなければなりませんか？",
                a: "いいえ、ご相談だけでも構いません。ご説明を聞いていただいた上で、ご依頼されるかどうかはお客様のご判断にお任せします。"
              }
            ].map((item, i) => (
              <div key={i} className="bg-surface/50 rounded-xl p-6 border border-slate-100">
                <h3 className="font-bold text-primary mb-2 flex items-start gap-2">
                  <span className="text-accent">Q.</span>
                  {item.q}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed pl-6">
                  <span className="text-primary font-medium">A. </span>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative bg-gradient-to-br from-primary via-primary to-secondary overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
        <div className="absolute top-0 left-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 px-6 text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              まずは無料相談から
            </h2>
            <p className="text-slate-400 mb-4 text-base max-w-xl mx-auto">
              借金問題は一人で悩まず、弁護士にご相談ください。<br className="hidden md:block" />
              お客様の状況に合わせた解決方法をご提案します。
            </p>
            <p className="text-slate-500 text-sm mb-8 max-w-xl mx-auto">
              ※ご相談は受任を保証するものではありません。法的助言は弁護士との面談後に行います。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/consult"
                className="inline-flex items-center justify-center h-14 px-10 bg-gradient-gold text-primary text-lg font-bold rounded-full hover:shadow-2xl transition-all duration-300 shadow-lg hover-lift"
              >
                無料相談を予約する
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a
                href="tel:0120-XXX-XXX"
                className="inline-flex items-center justify-center h-14 px-10 bg-white/10 backdrop-blur text-white text-lg font-medium rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover-lift"
              >
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                0120-XXX-XXX
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-slate-400 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          {/* Legal Notice */}
          <div className="bg-white/5 rounded-xl p-6 mb-10">
            <h4 className="text-white font-bold text-sm mb-3">重要なお知らせ</h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>・本サービスにおける法律相談の提供主体は、弁護士法人柳田法律事務所です。</li>
              <li>・当サイトの情報は一般的な説明であり、個別の法的助言ではありません。</li>
              <li>・ご相談は受任を保証するものではなく、利益相反等により受任できない場合があります。</li>
              <li>・最適な手続きは弁護士がお客様の状況を確認した上で判断いたします。</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-gold rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-serif font-bold text-white">弁護士法人 柳田法律事務所</span>
                </div>
              </div>
              <div className="text-sm leading-relaxed">
                <p className="mb-2">〒XXX-XXXX</p>
                <p className="mb-2">東京都○○区○○ X-X-X ○○ビル X階</p>
                <p className="mb-2">弁護士登録番号：XXXXX号</p>
                <p>東京弁護士会所属</p>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-sm">お問い合わせ</h4>
              <p className="text-sm leading-loose mb-2">
                <a href="tel:0120-XXX-XXX" className="hover:text-accent transition-colors">0120-XXX-XXX</a>
              </p>
              <p className="text-xs text-slate-500">
                受付時間：平日 9:00〜18:00<br />
                ※土日祝も相談予約受付中
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-sm">リンク</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-accent transition-colors">事務所概要</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">弁護士紹介</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">プライバシーポリシー</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">利用規約</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-600">
              本サービスの法律相談の提供主体は弁護士法人柳田法律事務所です。<span className="hidden md:inline"> | </span><br className="md:hidden" />
              システム提供：ZettAI株式会社
            </p>
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} 弁護士法人 柳田法律事務所. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
