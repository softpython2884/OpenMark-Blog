'use client';

import { Block } from './BlockTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X, Youtube, Play } from 'lucide-react';
import { useState } from 'react';

interface VideoBlockProps {
  block: Block;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
}

export function VideoBlock({ block, onUpdate, onDelete }: VideoBlockProps) {
  const [isEditing, setIsEditing] = useState(!block.content.videoId);
  const [videoUrl, setVideoUrl] = useState(block.content.videoUrl || '');
  const [videoId, setVideoId] = useState(block.content.videoId || '');
  const [title, setTitle] = useState(block.content.title || '');

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleUrlChange = (url: string) => {
    setVideoUrl(url);
    const id = extractYouTubeId(url);
    if (id) {
      setVideoId(id);
    }
  };

  const handleSave = () => {
    if (!videoId) return;
    
    onUpdate({
      ...block,
      content: {
        ...block.content,
        videoUrl,
        videoId,
        title
      }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setVideoUrl(block.content.videoUrl || '');
    setVideoId(block.content.videoId || '');
    setTitle(block.content.title || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Youtube className="h-5 w-5" />
                Vidéo
              </h3>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="videoUrl">URL de la vidéo (YouTube)</Label>
                <Input
                  id="videoUrl"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Coller l'URL d'une vidéo YouTube pour l'intégrer automatiquement
                </p>
              </div>

              <div>
                <Label htmlFor="videoTitle">Titre de la vidéo (optionnel)</Label>
                <Input
                  id="videoTitle"
                  placeholder="Titre de la vidéo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {videoId && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Aperçu :</p>
                  <div className="aspect-video bg-black rounded-md flex items-center justify-center">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!videoId}>
                Insérer la vidéo
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Annuler
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Youtube className="h-4 w-4" />
          Vidéo
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            Modifier
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Supprimer
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {title && (
          <h4 className="font-medium text-lg">{title}</h4>
        )}
        
        <div className="aspect-video bg-black rounded-md overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-md"
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Play className="h-4 w-4" />
          <span>Vidéo YouTube intégrée</span>
        </div>
      </div>
    </div>
  );
}
