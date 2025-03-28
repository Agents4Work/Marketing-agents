"use client";

import { useState } from 'react';
import { useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AgentWorkspace() {
  const params = useParams();
  const [formData, setFormData] = useState({
    objetivo: '',
    producto: '',
    audiencia: '',
    estilo: 'profesional',
    longitud: 'media',
    plataforma: 'web',
    contexto: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const response = await fetch('http://localhost:8080/api/v1/copywriter/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          type: params.type,
          agentId: params.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Error generating content');
      }

      const data = await response.json();
      setGeneratedContent(data.content || data.result || data.generated_text);
    } catch (error) {
      console.error('Error:', error);
      setGeneratedContent('Error: No se pudo generar el contenido. Por favor, intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Copywriter Workspace</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="objetivo">Objetivo</Label>
              <Input
                id="objetivo"
                placeholder="¿Qué quieres lograr con este contenido?"
                value={formData.objetivo}
                onChange={(e) => handleInputChange('objetivo', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="producto">Producto o Servicio</Label>
              <Input
                id="producto"
                placeholder="Describe tu producto o servicio"
                value={formData.producto}
                onChange={(e) => handleInputChange('producto', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="audiencia">Audiencia Objetivo</Label>
              <Input
                id="audiencia"
                placeholder="¿A quién va dirigido?"
                value={formData.audiencia}
                onChange={(e) => handleInputChange('audiencia', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="estilo">Estilo</Label>
              <Select
                value={formData.estilo}
                onValueChange={(value) => handleInputChange('estilo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profesional">Profesional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="amigable">Amigable</SelectItem>
                  <SelectItem value="persuasivo">Persuasivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="longitud">Longitud</Label>
              <Select
                value={formData.longitud}
                onValueChange={(value) => handleInputChange('longitud', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la longitud" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corta">Corta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="larga">Larga</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="plataforma">Plataforma</Label>
              <Select
                value={formData.plataforma}
                onValueChange={(value) => handleInputChange('plataforma', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Sitio Web</SelectItem>
                  <SelectItem value="social">Redes Sociales</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="anuncios">Anuncios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contexto">Contexto Adicional</Label>
              <Textarea
                id="contexto"
                placeholder="Proporciona cualquier contexto adicional relevante"
                value={formData.contexto}
                onChange={(e) => handleInputChange('contexto', e.target.value)}
                rows={4}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isGenerating}
            >
              {isGenerating ? 'Generando...' : 'Generar Contenido'}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Contenido Generado</h2>
          <div className="min-h-[200px] p-4 bg-gray-50 rounded-lg">
            {generatedContent ? (
              <div className="whitespace-pre-wrap">{generatedContent}</div>
            ) : (
              <div className="text-gray-500 text-center">
                El contenido generado aparecerá aquí
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 