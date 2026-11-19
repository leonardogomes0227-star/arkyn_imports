import { Component, type ReactNode } from 'react'

// Se algo quebrar na tela, o cliente vê uma saída em vez de uma página em branco.
export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <section style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--display, serif)' }}>Algo deu errado por aqui</h1>
          <p>Recarregue a página. Se continuar, fale com a gente pelo WhatsApp.</p>
          <p><button className="btn" onClick={() => { window.location.href = '/' }}>Voltar ao início</button></p>
        </div>
      </section>
    )
  }
}
