export interface Block {
  id: string;
  type: BlockType;
  content: any;
  props?: Record<string, any>;
}

export type BlockType = 
  | 'text'
  | 'heading'
  | 'image'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'code'
  | 'divider'
  | 'spoiler'
  | 'timeline'
  | 'video';

export interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: string;
  description: string;
  defaultProps?: Record<string, any>;
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: 'text',
    label: 'Texte',
    icon: 'Type',
    description: 'Paragraphe de texte simple',
    defaultProps: { content: '<p>Votre texte ici...</p>' }
  },
  {
    type: 'heading',
    label: 'Titre',
    icon: 'Heading1',
    description: 'Titre principal',
    defaultProps: { level: 1, content: 'Votre titre' }
  },
  {
    type: 'image',
    label: 'Image',
    icon: 'Image',
    description: 'Insérer une image',
    defaultProps: { src: '', alt: '', caption: '' }
  },
  {
    type: 'bulletList',
    label: 'Liste à puces',
    icon: 'List',
    description: 'Liste avec des puces',
    defaultProps: { items: ['Premier élément', 'Deuxième élément'] }
  },
  {
    type: 'orderedList',
    label: 'Liste numérotée',
    icon: 'ListOrdered',
    description: 'Liste numérotée',
    defaultProps: { items: ['Premier élément', 'Deuxième élément'] }
  },
  {
    type: 'blockquote',
    label: 'Citation',
    icon: 'Quote',
    description: 'Bloc de citation',
    defaultProps: { content: 'Votre citation ici...', author: '' }
  },
  {
    type: 'code',
    label: 'Code',
    icon: 'Code',
    description: 'Bloc de code',
    defaultProps: { code: '// Votre code ici', language: 'javascript' }
  },
  {
    type: 'spoiler',
    label: 'Spoiler',
    icon: 'EyeOff',
    description: 'Contenu caché révélé au clic',
    defaultProps: { title: 'Spoiler', content: 'Contenu caché...' }
  },
  {
    type: 'timeline',
    label: 'Timeline',
    icon: 'Clock',
    description: 'Séquence d\'étapes',
    defaultProps: { 
      items: [
        { id: '1', title: 'Étape 1', content: 'Description de la première étape', completed: false },
        { id: '2', title: 'Étape 2', content: 'Description de la deuxième étape', completed: false }
      ]
    }
  },
  {
    type: 'video',
    label: 'Vidéo',
    icon: 'Youtube',
    description: 'Intégrer une vidéo YouTube',
    defaultProps: { videoUrl: '', videoId: '', title: '' }
  },
  {
    type: 'divider',
    label: 'Séparateur',
    icon: 'Minus',
    description: 'Ligne de séparation',
    defaultProps: {}
  }
];

export const createBlock = (type: BlockType): Block => {
  const definition = BLOCK_DEFINITIONS.find(def => def.type === type);
  return {
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    content: definition?.defaultProps || {},
    props: definition?.defaultProps || {}
  };
};
