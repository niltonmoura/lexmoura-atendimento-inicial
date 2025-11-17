import { BACKEND_URL } from '../config';
import { ClientFormData, EntrevistaListItem, VisitaListItem } from '../types';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string; 
}

export const isBackendConfigured = (): boolean => {
    return (BACKEND_URL as string) && !(BACKEND_URL as string).startsWith('COLE_AQUI');
}

const postToAction = async (payload: object): Promise<ApiResponse> => {
  if (!isBackendConfigured()) {
    return { success: false, error: "A URL do backend não está configurada." };
  }
  
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na comunicação com o servidor: ${response.status}. Detalhes: ${errorText}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API POST Call Error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

const getFromAction = async (action: string, params: Record<string, string> = {}): Promise<ApiResponse> => {
    if (!isBackendConfigured()) {
        return { success: false, error: "A URL do backend não está configurada." };
    }
    
    const url = new URL(BACKEND_URL);
    url.searchParams.append('action', action);
    for (const key in params) {
        url.searchParams.append(key, params[key]);
    }

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            mode: 'cors',
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na comunicação com o servidor: ${response.status}. Detalhes: ${errorText}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API GET Call Error:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
};

export const criarPastaCliente = async (nome: string, cpf: string): Promise<ApiResponse> => {
  return postToAction({ action: 'criar_pasta', nome, cpf });
};

export const gerarDocumento = async (templateId: string, pastaDestinoId: string, nomeDocumento: string, dados: ClientFormData): Promise<ApiResponse> => {
  return postToAction({
    action: 'gerar_documento',
    templateId,
    pastaDestinoId,
    nomeDocumento,
    dados,
  });
};

export const logEntrevista = async (dados: { nome: string; cpf: string; area_juridica: string; }): Promise<ApiResponse> => {
    return postToAction({ action: 'log_entrevista', dados });
};

export const listarEntrevistas = async (): Promise<{ success: boolean; data?: EntrevistaListItem[]; error?: string }> => {
    const response = await getFromAction('listar_entrevistas');
    if (response.success) {
        return { success: true, data: response.data };
    }
    return { success: false, error: response.error || response.message };
};

export const listarVisitas = async (): Promise<{ success: boolean; data?: VisitaListItem[]; error?: string }> => {
    const response = await getFromAction('listar_visitas');
    if (response.success) {
        return { success: true, data: response.data };
    }
    return { success: false, error: response.error || response.message };
};
