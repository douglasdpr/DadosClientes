import React, { useState, useEffect } from 'react';
import './App.css';
import rawData from './data.json';

function App() {
  // Controle da Aba Principal Superior
  const [mainAppTab, setMainAppTab] = useState('comprovantes'); // 'comprovantes' ou 'clientes'

  // ==========================================
  // ESTADOS DO MÓDULO 1: COMPROVANTES (TMOV PAY)
  // ==========================================
  const [searchTermComp, setSearchTermComp] = useState('');
  const [compList, setCompList] = useState([]);
  const [filteredCompList, setFilteredCompList] = useState([]);
  const [selectedCompRow, setSelectedCompRow] = useState(null);
  const [sideRotation, setSideRotation] = useState(0);
  const [modalRotation, setModalRotation] = useState(0);
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);

  // ==========================================
  // ESTADOS DO MÓDULO 2: CLIENTES & AGENDAMENTOS (SOTRAN)
  // ==========================================
  const [sotranClients, setSotranClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [sotranTab, setSotranTab] = useState('principal'); // 'principal' | 'enderecos' | 'agendamentos' | 'produtos'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPassword, setShowPassword] = useState({});

  useEffect(() => {
    // Normalização inicial dos dados para ambos os módulos
    const initialCompData = rawData.map((item, idx) => {
      const contratoId = item.Contrato || item.Token || '3362525';
      const cleanName = (item.Local || 'CLIENTE').toLowerCase().replace(/[^a-z0-9]/g, '');
      return {
        idIndex: idx,
        idContrato: contratoId,
        cnpj: item.CNPJ || '73.410.326/0011-32',
        local: item.Local || 'CERVEJARIA PETROPOLIS S A',
        cidade: item.Cidade || 'Araucária',
        imagem: `https://api-tmov-pay.sotran.com.br/contratoQuitacoesSaldo/download?idContrato=${contratoId}&id=73&binary=true`,
        // Campos do módulo Sotran
        tipoPessoa: 'Jurídica',
        razaoSocial: item.Local || 'CERVEJARIA PETROPOLIS S A',
        nomeFantasia: item.Local || 'CERVEJARIA PETROPOLIS S/A',
        rg: '',
        email: 'expedicao@sotran.com.br',
        modeloImpressao: 'Padrão Sotran',
        expedidor: 'TMOV Logística',
        celular: '(44) 99999-0000',
        dataFundacao: '01/01/2014',
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

    setCompList(initialCompData);
    setFilteredCompList(initialCompData);
    setSotranClients(initialCompData);
    
    if (initialCompData.length > 0) {
      setSelectedCompRow(initialCompData[0]);
      setSelectedClient(initialCompData[0]);
    }
  }, []);

  // Filtro de Comprovantes
  useEffect(() => {
    const terms = searchTermComp.toLowerCase().split(' ').filter(t => t.trim() !== '');
    if (terms.length === 0) {
      setFilteredCompList(compList);
      return;
    }
    const filtered = compList.filter(row => {
      const rowText = `${row.cnpj} ${row.local} ${row.cidade} ${row.idContrato}`.toLowerCase();
      return terms.every(term => rowText.includes(term));
    });
    setFilteredCompList(filtered);
  }, [searchTermComp, compList]);

  // Funções de Rotação
  const rotateSide = (direction) => {
    setSideRotation(prev => direction === 'left' ? prev - 90 : prev + 90);
  };

  const rotateModal = (direction) => {
    setModalRotation(prev => direction === 'left' ? prev - 90 : prev + 90);
  };

  const getTransformStyle = (degrees) => {
    const normalized = ((degrees % 360) + 360) % 360;
    if (normalized === 90 || normalized === 270) {
      return { transform: `rotate(${degrees}deg) scale(0.7)` };
    }
    return { transform: `rotate(${degrees}deg) scale(1)` };
  };

  const togglePasswordVisibility = (portalId) => {
    setShowPassword(prev => ({ ...prev, [portalId]: !prev[portalId] }));
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copiado!`);
  };

  return (
    <div className="app-root-container">
      {/* BARRA FIXA DE NAVEGAÇÃO ENTRE MÓDULOS (ABAS PRINCIPAIS) */}
      <div className="main-module-switcher">
        <button 
          className={`module-tab ${mainAppTab === 'comprovantes' ? 'active' : ''}`}
          onClick={() => setMainAppTab('comprovantes')}
        >
          📄 Análise de Comprovantes (TMOV Pay)
        </button>
        <button 
          className={`module-tab ${mainAppTab === 'clientes' ? 'active' : ''}`}
          onClick={() => setMainAppTab('clientes')}
        >
          🏢 Gestão de Clientes & Agendamentos (Sotran)
        </button>
      </div>

      {/* ========================================================= */}
      {/* MÓDULO 1: ANÁLISE DE COMPROVANTES (ABA SEPARADA 1) */}
      {/* ========================================================= */}
      {mainAppTab === 'comprovantes' && (
        <div className="module-content comp-module">
          <header className="comp-topbar">
            <div>
              <span className="logo-bold">TMOV</span><span className="logo-light">pay</span>
              <span className="divider">|</span>
              <span className="page-title">Análise de Comprovantes Digitais</span>
            </div>
            <div className="status-pill">
              <span className="status-dot"></span>
              <span>{filteredCompList.length} Registros</span>
            </div>
          </header>

          <main className="comp-main-container">
            <div className="search-card">
              <input
                type="text"
                className="search-input"
                placeholder="Filtre por CNPJ, Local, Cidade ou ID do Contrato..."
                value={searchTermComp}
                onChange={(e) => setSearchTermComp(e.target.value)}
              />
            </div>

            <div className="content-grid">
              {/* Tabela de Comprovantes */}
              <section className="card table-card">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>CNPJ</th>
                        <th>Local</th>
                        <th>Cidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompList.slice(0, 1000).map((row) => {
                        const isSelected = selectedCompRow && selectedCompRow.idIndex === row.idIndex;
                        return (
                          <tr
                            key={row.idIndex}
                            className={isSelected ? 'selected-row' : ''}
                            onClick={() => { setSelectedCompRow(row); setSideRotation(0); }}
                          >
                            <td><strong>{row.cnpj}</strong></td>
                            <td>{row.local}</td>
                            <td>{row.cidade}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Pré-visualização Lateral */}
              <section className="card preview-card">
                {selectedCompRow && (
                  <div className="preview-header">
                    <span className="doc-badge-title">Contrato #{selectedCompRow.idContrato}</span>
                    <div className="rotation-controls">
                      <button className="btn btn-rotate" onClick={() => rotateSide('left')}>↶ Girar Esq</button>
                      <button className="btn btn-rotate" onClick={() => rotateSide('right')}>↷ Girar Dir</button>
                      <button className="btn btn-expand" onClick={() => setIsCompModalOpen(true)}>🔍 Expandir</button>
                    </div>
                  </div>
                )}

                <div className="preview-stage">
                  {!selectedCompRow ? (
                    <div className="placeholder-state">
                      <h3>Nenhum item selecionado</h3>
                      <p>Clique em uma linha da tabela para abrir o comprovante.</p>
                    </div>
                  ) : (
                    <div className="active-doc-stage" onClick={() => setIsCompModalOpen(true)}>
                      <div className="image-viewport" style={getTransformStyle(sideRotation)}>
                        <img
                          src={`${selectedCompRow.imagem}&t=${Date.now()}`}
                          alt="Comprovante"
                          className="doc-image"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </main>

          {/* Modal Tela Cheia Comprovante */}
          {isCompModalOpen && selectedCompRow && (
            <div className="lightbox-overlay" onClick={() => setIsCompModalOpen(false)}>
              <div className="lightbox-toolbar" onClick={(e) => e.stopPropagation()}>
                <span className="lightbox-title">
                  Contrato #{selectedCompRow.idContrato} - {selectedCompRow.local} ({selectedCompRow.cidade})
                </span>
                <div className="lightbox-controls">
                  <button className="btn btn-rotate" onClick={() => rotateModal('left')}>↶ Girar Esquerda</button>
                  <button className="btn btn-rotate" onClick={() => rotateModal('right')}>↷ Girar Direita</button>
                  <button className="btn-close" onClick={() => setIsCompModalOpen(false)}>&times;</button>
                </div>
              </div>
              <div className="lightbox-viewport" onClick={() => setIsCompModalOpen(false)}>
                <div className="modal-image-wrapper" style={getTransformStyle(modalRotation)} onClick={(e) => e.stopPropagation()}>
                  <img
                    src={`${selectedCompRow.imagem}&t=${Date.now()}`}
                    alt="Comprovante Full"
                    className="doc-image modal-doc-image"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MÓDULO 2: GESTÃO DE CLIENTES SOTRAN (ABA SEPARADA 2) */}
      {/* ========================================================= */}
      {mainAppTab === 'clientes' && (
        <div className="module-content sotran-system">
          <aside className={`sotran-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
            <div className="user-profile-header">
              <div className="user-avatar">👤</div>
              <div className="user-info">
                <span className="user-greeting">Olá,</span>
                <span className="user-fullname">DOUGLAS VINICIUS PRADO ROCHA ▾</span>
              </div>
            </div>

            <nav className="sidebar-menu">
              <div className="menu-item active-root"><span className="icon">🏠</span> Principal</div>
              <div className="menu-group">
                <div className="menu-header active-group"><span className="icon">⚙️</span> Configuração ▾</div>
                <div className="submenu">
                  <div className="submenu-header active-sub">Cadastros ▾</div>
                  <div className="submenu-list">
                    <span>Motorista</span>
                    <span>Proprietário</span>
                    <span className="sub-active">Cliente</span>
                    <span>Veículo</span>
                    <span>Estabelecimento</span>
                    <span>Produto</span>
                  </div>
                </div>
              </div>
              <div className="menu-item"><span className="icon">🚚</span> Oferta de Cargas ▾</div>
            </nav>
          </aside>

          <div className="sotran-main">
            <header className="sotran-topbar">
              <div className="topbar-left">
                <button className="btn-toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
                <div className="breadcrumbs">
                  <span>Clientes</span> / <span>Cadastros</span> / <span>Cliente</span> / <span className="current">Editar</span>
                </div>
              </div>
              <div className="topbar-right">
                <span className="notif-badge">🔔 <sup>0</sup></span>
                <span className="btn-exit">🚪 Sair</span>
              </div>
            </header>

            <div className="client-search-bar">
              <label>Selecionar Cliente da Base:</label>
              <select 
                value={selectedClient?.idIndex || ''} 
                onChange={(e) => {
                  const found = sotranClients.find(c => c.idIndex.toString() === e.target.value.toString());
                  if(found) setSelectedClient(found);
                }}
              >
                {sotranClients.map(c => (
                  <option key={c.idIndex} value={c.idIndex}>{c.idContrato} - {c.razaoSocial} ({c.cnpj})</option>
                ))}
              </select>
            </div>

            <div className="sotran-tabs">
              <button className={`tab ${sotranTab === 'principal' ? 'active' : ''}`} onClick={() => setSotranTab('principal')}>Principal</button>
              <button className={`tab ${sotranTab === 'enderecos' ? 'active' : ''}`} onClick={() => setSotranTab('enderecos')}>Endereços</button>
              <button className={`tab ${sotranTab === 'agendamentos' ? 'active' : ''}`} onClick={() => setSotranTab('agendamentos')}>Parâmetros & Agendamentos</button>
              <button className={`tab ${sotranTab === 'produtos' ? 'active' : ''}`} onClick={() => setSotranTab('produtos')}>Produtos/Espécies</button>
            </div>

            {selectedClient && (
              <div className="sotran-content-card">
                {sotranTab === 'principal' && (
                  <div className="sotran-form-layout">
                    <div className="form-column-left">
                      <div className="form-row">
                        <label>Código:</label>
                        <input type="text" className="input-disabled" value={selectedClient.idContrato} readOnly />
                      </div>
                      <div className="form-row">
                        <label>Tipo de Pessoa:</label>
                        <select value={selectedClient.tipoPessoa} readOnly><option>Jurídica</option></select>
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
                        <label>E-mail:</label>
                        <input type="text" value={selectedClient.email} readOnly />
                      </div>
                    </div>

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

                {sotranTab === 'agendamentos' && (
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
                              <button onClick={() => togglePasswordVisibility(portal.id)}>{showPassword[portal.id] ? 'Ocultar' : 'Ver'}</button>
                              <button onClick={() => copyToClipboard(portal.senha, 'Senha')}>Copiar</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="sotran-footer-actions">
                  <button className="btn-sotran-gray">‹ Voltar</button>
                  <button className="btn-sotran-green">✓ Salvar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
