import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Callout } from '@/components/ui/callout';

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attributes?: { variant: string, icon?: string }) => ReturnType;
      toggleCallout: (attributes?: { variant: string, icon?: string }) => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

const CalloutComponent = (props: any) => {
  const { variant, 'data-icon': icon } = props.node.attrs;

  return (
    <Callout
      variant={variant}
      icon={icon}
      className="not-prose"
      data-variant={variant}
      data-icon={icon}
    >
      <div ref={props.contentRef as React.RefObject<HTMLDivElement>} />
    </Callout>
  );
};


export const CalloutExtension = Node.create<CalloutOptions>({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: 'note',
      },
      'data-icon': {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-callout]',
        getAttrs: dom => {
          const element = dom as HTMLElement;
          return {
            variant: element.getAttribute('data-variant'),
            'data-icon': element.getAttribute('data-icon'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-callout': '' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutComponent);
  },

  addCommands() {
    return {
      setCallout: (attributes) => ({ commands }) => {
        return commands.setNode(this.name, attributes);
      },
      toggleCallout: (attributes) => ({ commands }) => {
        return commands.toggleNode(this.name, 'paragraph', attributes);
      },
      unsetCallout: () => ({ commands }) => {
        return commands.lift(this.name);
      },
    };
  },
});
