import React, { useState, useEffect } from 'react';
import './App.css';
import rawData from './data.json';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  
  const [activeTab, setActiveTab] = useState('agendamentos');
  const [showPassword, setShowPassword] = useState({});

  useEffect(() => {
    const initialClients = rawData.map((item, idx) => {
      const cleanName = (item.Local || 'CLIENTE').toLowerCase().replace(/[^a-z0-9]/g, '');
      return {
        id: item.Contrato || (1007139 + idx),
        tipoPessoa: 'Jurídica',
        cnpj: item.CNPJ || '00.000.000/0001-00',
        razaoSocial: item.Local || 'CLIENTE SEM RAZÃO SOCIAL',
        nomeFantasia: item.Local || 'LOCAL DE DESCARGA',
        cidade: item.Cidade || '--',
        celular: '(44) 99999-0000',
        email: 'contato@cliente.com.br',
        portaisAgendamento: [
          {
            id: 1,
            nomePortal: `Portal de Agendamento - ${item.Local}`,
            urlAcesso: `https://agendamento.${cleanName || 'empresa'}.com.br`,
            usuario: `agendamento.tmov_${idx + 1}`,
            senha: `Pass@Tmov${idx + 2026}`,
            observacao: 'Agendamento liberar obrigatoriamente 24h antes da descarga.'
          }
        ],
        contatosComerciais: [
          { id: 1, nome: 'Atendimento Expedição', cargo: 'Gerente de Logística', telefone: '(44) 3000-1000', email: 'expedicao@cliente.com.br' },
          { id: 2, nome: 'Coordenador Pátio', cargo: 'Agendador', telefone: '(44) 98888-2222', email: 'patio@cliente.com.br' }
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
    alert(`${label} copiado para a área de transferência!`);
  };

  return (
    <div className="App">
      <header className="top-nav">
        <div className="brand">
          <span className="logo-icon">🏢</span>
          <span className="logo-title">Gestão de Clientes & Portais de Agendamento</span>
        </div>
        <div className="user-profile">
          <span className="status-badge">Ativo</span>
          <span className="user-name">Douglas DPR</span>
        </div>
      </header>

      <div className="layout-body">
        <aside className="sidebar-clients">
          <div className="sidebar-search">
            <input 
              type="text" 
              placeholder="🔍 Buscar Razão Social, CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="client-list">
            {filteredClients.map((client) => (
              <div 
                key={client.id}
                className={`client-item ${selectedClient?.id === client.id ? 'active' : ''}`}
                onClick={() => setSelectedClient(client)}
              >
                <div className="client-title">{client.razaoSocial}</div>
                <div className="client-sub">{client.cnpj} | {client.cidade}</div>
              </div>
            ))}
          </div>
        </aside>

        <main className="main-content">
          {selectedClient ? (
            <div className="form-card">
              <div className="client-header">
                <div>
                  <span className="code-tag">CÓDIGO: {selectedClient.id}</span>
                  <h2>{selectedClient.razaoSocial}</h2>
                </div>
                <button className="btn-save-main">💾 Salvar Alterações</button>
              </div>

              <nav className="tab-bar">
                <button 
                  className={`tab-btn ${activeTab === 'principal' ? 'active' : ''}`}
                  onClick={() => setActiveTab('principal')}
                >
                  Principal
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'agendamentos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('agendamentos')}
                >
                  🔑 Portais de Agendamento ({selectedClient.portaisAgendamento.length})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'contatos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('contatos')}
                >
                  📞 Contatos Comerciais ({selectedClient.contatosComerciais.length})
                </button>
              </nav>

              <div className="tab-content">
                {activeTab === 'principal' && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Tipo de Pessoa:</label>
                      <select value={selectedClient.tipoPessoa} readOnly>
                        <option value="Jurídica">Jurídica</option>
                        <option value="Física">Física</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>CNPJ:</label>
                      <input type="text" value={selectedClient.cnpj} readOnly />
                    </div>

                    <div className="form-group">
                      <label>Razão Social:</label>
                      <input type="text" value={selectedClient.razaoSocial} readOnly />
                    </div>

                    <div className="form-group">
                      <label>Nome Fantasia:</label>
                      <input type="text" value={selectedClient.nomeFantasia} readOnly />
                    </div>

                    <div className="form-group">
                      <label>Cidade / UF:</label>
                      <input type="text" value={selectedClient.cidade} readOnly />
                    </div>

                    <div className="form-group">
                      <label>Celular / WhatsApp:</label>
                      <input type="text" value={selectedClient.celular} readOnly />
                    </div>
                  </div>
                )}

                {activeTab === 'agendamentos' && (
                  <div className="agendamento-section">
                    <div className="section-title">
                      <h3>Credenciais e Sites de Agendamento de Carga</h3>
                      <button className="btn-add-item">+ Adicionar Novo Portal</button>
                    </div>

                    {selectedClient.portaisAgendamento.map((portal) => (
                      <div key={portal.id} className="portal-card">
                        <div className="portal-header">
                          <h4>{portal.nomePortal}</h4>
                          <a href={portal.urlAcesso} target="_blank" rel="noreferrer" className="link-access">
                            🔗 Abrir Site de Agendamento ↗
                          </a>
                        </div>

                        <div className="credentials-grid">
                          <div className="form-group">
                            <label>Link de Acesso (URL):</label>
                            <div className="input-with-btn">
                              <input type="text" value={portal.urlAcesso} readOnly />
                              <button onClick={() => copyToClipboard(portal.urlAcesso, 'Link')}>📋 Copiar</button>
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Usuário de Acesso:</label>
                            <div className="input-with-btn">
                              <input type="text" value={portal.usuario} readOnly />
                              <button onClick={() => copyToClipboard(portal.usuario, 'Usuário')}>📋 Copiar</button>
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Senha:</label>
                            <div className="input-with-btn">
                              <input 
                                type={showPassword[portal.id] ? "text" : "password"} 
                                value={portal.senha} 
                                readOnly 
                              />
                              <button onClick={() => togglePasswordVisibility(portal.id)}>
                                {showPassword[portal.id] ? '🙈 Ocultar' : '👁️ Ver'}
                              </button>
                              <button onClick={() => copyToClipboard(portal.senha, 'Senha')}>📋 Copiar</button>
                            </div>
                          </div>
                        </div>

                        <div className="form-group full-width">
                          <label>Regras de Agendamento / Observações:</label>
                          <textarea value={portal.observacao} rows="2" readOnly />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'contatos' && (
                  <div className="contatos-section">
                    <div className="section-title">
                      <h3>Contatos do Cliente / Expedição</h3>
                      <button className="btn-add-item">+ Novo Contato</button>
                    </div>

                    <table className="sub-table">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Cargo / Função</th>
                          <th>Telefone</th>
                          <th>E-mail</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedClient.contatosComerciais.map((c) => (
                          <tr key={c.id}>
                            <td><strong>{c.nome}</strong></td>
                            <td>{c.cargo}</td>
                            <td>{c.telefone}</td>
                            <td>{c.email}</td>
                            <td>
                              <button className="btn-table-action">✏️ Editar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">Selecione um cliente ao lado.</div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
