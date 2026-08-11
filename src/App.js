import React, { useState, useEffect } from 'react';
import './App.css';
import rawData from './data.json';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  
  // Controle de Abas
  const [activeTab, setActiveTab] = useState('principal');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Credenciais
  const [showPassword, setShowPassword] = useState({});

  useEffect(() => {
    const initialClients = rawData.map((item, idx) => {
      const cleanName = (item.Local || 'CLIENTE').toLowerCase().replace(/[^a-z0-9]/g, '');
      return {
        id: item.Contrato || (1007139 + idx),
        tipoPessoa: 'Jurídica',
        cnpj: item.CNPJ || '73.410.326/0011-32',
        razaoSocial: item.Local || 'CERVEJARIA PETROPOLIS S A',
        nomeFantasia: item.Local || 'CERVEJARIA PETROPOLIS S/A',
        rg: '',
        email: 'expedicao@sotran.com.br',
        modeloImpressao: 'Padrão Sotran',
        expedidor: 'TMOV Logística',
        celular: '(44) 99999-0000',
        dataFundacao: '01/01/2014',
        cidade: item.Cidade || 'Araucária',
        portaisAgendamento: [
          {
            id: 1,
            nomePortal: `Portal de Agendamento - ${item.Local}`,
            urlAcesso: `https://agendamento.${cleanName || 'empresa'}.com.br`,
            usuario: `agendamento.sotran_${idx + 1}`,
            senha: `Pass@Sotran${idx + 2026}`,
            observacao: 'Agendamento liberar obrigatoriamente 24h antes da descarga.'
          }
        ]
      };
    });

    setClients(initialClients);
    setFilteredClients(initialClients);
    if (initialClients.length > 0) {
      setSelectedClient(initialClients[0]);
    }
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = clients.filter(c => 
      c.razaoSocial.toLowerCase().includes(term) ||
      c.cnpj.includes(term) ||
      c.cidade.toLowerCase().includes(term)
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const togglePasswordVisibility = (portalId) => {
    setShowPassword(prev => ({ ...prev, [portalId]: !prev[portalId] }));
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copiado!`);
  };

  return (
    <div className="sotran-system">
      {/* SIDEBAR ESQUERDA ESBURA */}
      <aside className={`sotran-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="user-profile-header">
          <div className="user-avatar">👤</div>
          <div className="user-info">
            <span className="user-greeting">Olá,</span>
            <span className="user-fullname">DOUGLAS VINICIUS PRADO ROCHA ▾</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-item active-root">
            <span className="icon">🏠</span> Principal
          </div>
          
          <div className="menu-group">
            <div className="menu-header active-group">
              <span className="icon">⚙️</span> Configuração ▾
            </div>
            <div className="submenu">
              <div className="submenu-header active-sub">Cadastros ▾</div>
              <div className="submenu-list">
                <span>Motorista</span>
                <span>Proprietário</span>
                <span>Configurações Cliente</span>
                <span>Usuários</span>
                <span>Usuários TMOV</span>
                <span>Permissão</span>
                <span>Perfil auditoria</span>
                <span>Espécie</span>
                <span>Tipo de Cavalo</span>
                <span>Empresa</span>
                <span>Filial</span>
                <span>Grupo Usuário</span>
                <span>Veículo</span>
                <span className="sub-active">Cliente</span>
                <span>Estabelecimento</span>
                <span>Motivo</span>
                <span>Tipo de carreta</span>
                <span>Produto</span>
              </div>
            </div>
          </div>

          <div className="menu-item"><span className="icon">🔔</span> Notificações ▾</div>
          <div className="menu-item"><span className="icon">💬</span> Suporte ▾</div>
          <div className="menu-item"><span className="icon">📊</span> Auditoria ▾</div>
          <div className="menu-item"><span className="icon">📱</span> Gestão do App ▾</div>
          <div className="menu-item"><span className="icon">🚚</span> Oferta de Cargas ▾</div>
          <div className="menu-item"><span className="icon">🚛</span> Transportadora ▾</div>
          <div className="menu-item"><span className="icon">📄</span> CTE Automático ▾</div>
          <div className="menu-item"><span className="icon">💳</span> Pagamento de frete ▾</div>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="sotran-main">
        {/* BARRA SUPERIOR */}
        <header className="sotran-topbar">
          <div className="topbar-left">
            <button className="btn-toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <div className="breadcrumbs">
              <span>Clientes</span> / <span>Cadastros</span> / <span>Cliente</span> / <span className="current">Editar</span>
            </div>
          </div>
          <div className="topbar-right">
            <span className="notif-badge">🔔 <sup>0</sup></span>
            <span className="btn-exit">🚪 Sair</span>
          </div>
        </header>

        {/* MENSAGEM DE BUSCA DE CLIENTES */}
        <div className="client-search-bar">
          <label>Selecionar Cliente da Base:</label>
          <select 
            value={selectedClient?.id || ''} 
            onChange={(e) => {
              const found = clients.find(c => c.id.toString() === e.target.value.toString());
              if(found) setSelectedClient(found);
            }}
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.id} - {c.razaoSocial} ({c.cnpj})</option>
            ))}
          </select>
        </div>

        {/* ABAS SUPERIORES DA SOTRAN */}
        <div className="sotran-tabs">
          <button className={`tab ${activeTab === 'principal' ? 'active' : ''}`} onClick={() => setActiveTab('principal')}>
            Principal
          </button>
          <button className={`tab ${activeTab === 'enderecos' ? 'active' : ''}`} onClick={() => setActiveTab('enderecos')}>
            Endereços
          </button>
          <button className={`tab ${activeTab === 'agendamentos' ? 'active' : ''}`} onClick={() => setActiveTab('agendamentos')}>
            Parâmetros & Agendamentos
          </button>
          <button className={`tab ${activeTab === 'produtos' ? 'active' : ''}`} onClick={() => setActiveTab('produtos')}>
            Produtos/Espécies
          </button>
        </div>

        {/* FORMULÁRIO PRINCIPAL */}
        {selectedClient && (
          <div className="sotran-content-card">
            {activeTab === 'principal' && (
              <div className="sotran-form-layout">
                {/* LADO ESQUERDO: CAMPOS DE TEXTO */}
                <div className="form-column-left">
                  <div className="form-row">
                    <label>Código:</label>
                    <input type="text" className="input-disabled" value={selectedClient.id} readOnly />
                  </div>

                  <div className="form-row">
                    <label>Tipo de Pessoa:</label>
                    <select value={selectedClient.tipoPessoa} readOnly>
                      <option>Jurídica</option>
                      <option>Física</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <label className="required">* CNPJ:</label>
                    <input type="text" value={selectedClient.cnpj} readOnly />
                  </div>

                  <div className="form-row">
                    <label className="required">* Razão Social:</label>
                    <input type="text" value={selectedClient.razaoSocial} readOnly />
                  </div>

                  <div className="form-row">
                    <label className="required">* Nome Fantasia:</label>
                    <input type="text" value={selectedClient.nomeFantasia} readOnly />
                  </div>

                  <div className="form-row">
                    <label>RG:</label>
                    <input type="text" value={selectedClient.rg} placeholder="" readOnly />
                  </div>

                  <div className="form-row">
                    <label>E-mail:</label>
                    <input type="text" value={selectedClient.email} readOnly />
                  </div>

                  <div className="form-row">
                    <label>Modelo de impressão:</label>
                    <select value={selectedClient.modeloImpressao} readOnly>
                      <option>Padrão Sotran</option>
                    </select>
                  </div>
                </div>

                {/* LADO DIREITO: IMAGENS E EXPEDIDOR */}
                <div className="form-column-right">
                  <div className="image-boxes-container">
                    <div className="upload-box">
                      <div className="cloud-icon">☁️</div>
                      <span>Imagem Cliente</span>
                      <div className="box-buttons">
                        <button className="btn-box">Enviar</button>
                        <button className="btn-box">Remover</button>
                      </div>
                    </div>

                    <div className="logo-box">
                      <div className="logo-placeholder">GP</div>
                      <span className="logo-text">GRUPOPETRÓPOLIS</span>
                      <div className="box-buttons">
                        <button className="btn-box">Enviar</button>
                        <button className="btn-box">Remover</button>
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <label>Expedidor:</label>
                    <input type="text" value={selectedClient.expedidor} readOnly />
                  </div>

                  <div className="form-row">
                    <label className="required">* Celular:</label>
                    <input type="text" value={selectedClient.celular} readOnly />
                  </div>

                  <div className="form-row">
                    <label className="required">* Data de Fundação:</label>
                    <input type="text" value={selectedClient.dataFundacao} readOnly />
                  </div>
                </div>
              </div>
            )}

            {/* ABA DE AGENDAMENTOS E CREDENCIAIS */}
            {activeTab === 'agendamentos' && (
              <div className="agendamentos-tab-content">
                <h3 className="section-heading">Cadastro de Credenciais e Sites de Agendamento</h3>
                
                {selectedClient.portaisAgendamento.map((portal) => (
                  <div key={portal.id} className="sotran-portal-card">
                    <div className="portal-header-line">
                      <strong>{portal.nomePortal}</strong>
                      <a href={portal.urlAcesso} target="_blank" rel="noreferrer" className="sotran-link">
                        🔗 Acessar Portal de Agendamento ↗
                      </a>
                    </div>

                    <div className="portal-grid">
                      <div className="form-row">
                        <label>Usuário de Acesso:</label>
                        <div className="input-group-sotran">
                          <input type="text" value={portal.usuario} readOnly />
                          <button onClick={() => copyToClipboard(portal.usuario, 'Usuário')}>Copiar</button>
                        </div>
                      </div>

                      <div className="form-row">
                        <label>Senha:</label>
                        <div className="input-group-sotran">
                          <input type={showPassword[portal.id] ? "text" : "password"} value={portal.senha} readOnly />
                          <button onClick={() => togglePasswordVisibility(portal.id)}>
                            {showPassword[portal.id] ? 'Ocultar' : 'Ver'}
                          </button>
                          <button onClick={() => copyToClipboard(portal.senha, 'Senha')}>Copiar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CADASTRO DE ENVIO DE E-MAIL (SEÇÃO INFERIOR DO PRINT) */}
            <div className="email-section">
              <h3 className="email-title">Cadastro de envio de E-mail</h3>
              <div className="email-input-row">
                <input type="text" placeholder="" />
                <button className="btn-add-green">+</button>
              </div>

              <table className="sotran-table">
                <thead>
                  <tr>
                    <th>E-mail</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="2" className="empty-table-row">Nenhum registro a ser exibido.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* BOTÕES DE AÇÃO NO RODAPÉ */}
            <div className="sotran-footer-actions">
              <button className="btn-sotran-gray">‹ Voltar</button>
              <button className="btn-sotran-green">✓ Salvar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
