import { CollectionRepository } from '@/application/ports/collection-repository';
import { AlbumSheet, AlbumSlot, SlotState } from '@/domain/entities/collection-sheet';

// Espelha o seed (supabase/seed.sql) — escudos especiais + craques por seleção.
const RAW: Omit<AlbumSlot, 'state'>[] = [
  { itemId: 'BRA', stickerNumber: 'BRA', name: 'Escudo — Brasil', country: 'Brasil', isSpecial: true },
  { itemId: 'ARG', stickerNumber: 'ARG', name: 'Escudo — Argentina', country: 'Argentina', isSpecial: true },
  { itemId: 'FRA', stickerNumber: 'FRA', name: 'Escudo — França', country: 'França', isSpecial: true },
  { itemId: 'ENG', stickerNumber: 'ENG', name: 'Escudo — Inglaterra', country: 'Inglaterra', isSpecial: true },
  { itemId: 'POR', stickerNumber: 'POR', name: 'Escudo — Portugal', country: 'Portugal', isSpecial: true },
  { itemId: 'ESP', stickerNumber: 'ESP', name: 'Escudo — Espanha', country: 'Espanha', isSpecial: true },
  { itemId: '7', stickerNumber: '7', name: 'Vini Jr.', country: 'Brasil', isSpecial: false },
  { itemId: '10', stickerNumber: '10', name: 'Neymar Jr.', country: 'Brasil', isSpecial: false },
  { itemId: '21', stickerNumber: '21', name: 'Rodrygo', country: 'Brasil', isSpecial: false },
  { itemId: '30', stickerNumber: '30', name: 'Lionel Messi', country: 'Argentina', isSpecial: false },
  { itemId: '31', stickerNumber: '31', name: 'Julián Álvarez', country: 'Argentina', isSpecial: false },
  { itemId: '32', stickerNumber: '32', name: 'Enzo Fernández', country: 'Argentina', isSpecial: false },
  { itemId: '40', stickerNumber: '40', name: 'Kylian Mbappé', country: 'França', isSpecial: false },
  { itemId: '41', stickerNumber: '41', name: 'Aurélien Tchouaméni', country: 'França', isSpecial: false },
  { itemId: '42', stickerNumber: '42', name: 'Ousmane Dembélé', country: 'França', isSpecial: false },
  { itemId: '50', stickerNumber: '50', name: 'Jude Bellingham', country: 'Inglaterra', isSpecial: false },
  { itemId: '51', stickerNumber: '51', name: 'Harry Kane', country: 'Inglaterra', isSpecial: false },
  { itemId: '52', stickerNumber: '52', name: 'Bukayo Saka', country: 'Inglaterra', isSpecial: false },
  { itemId: '60', stickerNumber: '60', name: 'Cristiano Ronaldo', country: 'Portugal', isSpecial: false },
  { itemId: '61', stickerNumber: '61', name: 'Bruno Fernandes', country: 'Portugal', isSpecial: false },
  { itemId: '62', stickerNumber: '62', name: 'Rafael Leão', country: 'Portugal', isSpecial: false },
  { itemId: '70', stickerNumber: '70', name: 'Lamine Yamal', country: 'Espanha', isSpecial: false },
  { itemId: '71', stickerNumber: '71', name: 'Pedri', country: 'Espanha', isSpecial: false },
  { itemId: '72', stickerNumber: '72', name: 'Rodri', country: 'Espanha', isSpecial: false },
];

// Estados iniciais do demo — dá vida ao álbum (tenho/repetida) sem exigir
// que o usuário marque tudo à mão. Só dado de demonstração.
const SEED_STATES: Record<string, SlotState> = {
  BRA: 'have',
  '7': 'have',
  '10': 'duplicate',
  '21': 'have',
  ARG: 'have',
  '30': 'duplicate',
  FRA: 'have',
  '50': 'have',
};

export class MockCollectionRepository implements CollectionRepository {
  private states = new Map<string, SlotState>(Object.entries(SEED_STATES));

  async getActiveAlbumSheet(): Promise<AlbumSheet> {
    return {
      collectionName: 'Copa 2026',
      slots: RAW.map((s) => ({ ...s, state: this.states.get(s.itemId) ?? 'missing' })),
    };
  }

  async setSlotState(itemId: string, state: SlotState): Promise<void> {
    this.states.set(itemId, state);
  }

  async hasCollectionData(): Promise<boolean> {
    // Demo já "montado" — não força onboarding no modo mock.
    return true;
  }
}
