import type { TimberProperties } from '@/types/materials';

export const TIMBER_GRADES: Record<string, TimberProperties> = {
  C24: {
    grade: 'C24', fm_k: 24, ft_0_k: 14.5, ft_90_k: 0.4,
    fc_0_k: 21, fc_90_k: 2.5, fv_k: 4.0,
    E_0_mean: 11000, E_0_05: 7400, E_90_mean: 370, G_mean: 690,
    rho_k: 350, rho_mean: 420,
  },
  C16: {
    grade: 'C16', fm_k: 16, ft_0_k: 10, ft_90_k: 0.3,
    fc_0_k: 17, fc_90_k: 2.2, fv_k: 3.2,
    E_0_mean: 8000, E_0_05: 5400, E_90_mean: 270, G_mean: 500,
    rho_k: 310, rho_mean: 370,
  },
};

export const GLULAM_GRADES: Record<string, TimberProperties> = {
  GL24h: {
    grade: 'GL24h', fm_k: 24, ft_0_k: 19.2, ft_90_k: 0.5,
    fc_0_k: 24, fc_90_k: 2.5, fv_k: 3.5,
    E_0_mean: 11500, E_0_05: 9600, E_90_mean: 300, G_mean: 650,
    rho_k: 385, rho_mean: 420,
  },
  GL28h: {
    grade: 'GL28h', fm_k: 28, ft_0_k: 22.3, ft_90_k: 0.5,
    fc_0_k: 26.5, fc_90_k: 2.5, fv_k: 3.5,
    E_0_mean: 12600, E_0_05: 10500, E_90_mean: 300, G_mean: 650,
    rho_k: 425, rho_mean: 460,
  },
  GL32h: {
    grade: 'GL32h', fm_k: 32, ft_0_k: 25.6, ft_90_k: 0.5,
    fc_0_k: 29, fc_90_k: 2.5, fv_k: 3.5,
    E_0_mean: 13700, E_0_05: 11100, E_90_mean: 300, G_mean: 650,
    rho_k: 440, rho_mean: 480,
  },
};

export const K_MOD: Record<string, Record<string, number>> = {
  '1': { permanent: 0.60, 'long-term': 0.70, 'medium-term': 0.80, 'short-term': 0.90, instantaneous: 1.10 },
  '2': { permanent: 0.60, 'long-term': 0.70, 'medium-term': 0.80, 'short-term': 0.90, instantaneous: 1.10 },
  '3': { permanent: 0.50, 'long-term': 0.55, 'medium-term': 0.65, 'short-term': 0.70, instantaneous: 0.90 },
};

export const GAMMA_M = {
  solidTimber: 1.3,
  glulam: 1.25,
  clt: 1.25,
  connections: 1.3,
};

export const K_DEF: Record<string, number> = {
  '1': 0.60,
  '2': 0.80,
  '3': 2.00,
};
