
'use client';

import { useTransition } from 'react';
import type { Report } from '@/lib/definitions';
import { updateReportStatus } from '@/lib/actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, X, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import Link from 'next/link';

export function ReportManager({ reports }: { reports: Report[] }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleStatusUpdate = (reportId: number, status: 'resolved' | 'dismissed') => {
    startTransition(async () => {
      try {
        const result = await updateReportStatus(reportId, status);
        if (result.success) {
          toast({
            title: 'Signalement mis à jour',
            description: `Le signalement a été marqué comme ${status === 'resolved' ? 'résolu' : 'rejeté'}.`,
          });
        } else {
          throw new Error(result.message);
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: error.message,
        });
      }
    });
  };

  return (
    <div className="border rounded-lg">
      <Table>
        {!reports.length && (
          <TableCaption>Aucun signalement en attente.</TableCaption>
        )}
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Contenu signalé</TableHead>
            <TableHead>Raison</TableHead>
            <TableHead>Signalé par</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>
                <Badge variant={report.type === 'article' ? 'secondary' : 'outline'}>
                  {report.type}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                <Link href={report.itemUrl} target="_blank" className="hover:underline flex items-center gap-2">
                  {report.itemContent} <ExternalLink className="h-4 w-4 shrink-0" />
                </Link>
              </TableCell>
              <TableCell>{report.reason}</TableCell>
              <TableCell>{report.reporterName}</TableCell>
              <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(report.id, 'resolved')}
                        disabled={isPending}
                        className="text-green-600 hover:text-green-700"
                    >
                        <Check className="mr-2 h-4 w-4" /> Résoudre
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(report.id, 'dismissed')}
                        disabled={isPending}
                         className="text-red-600 hover:text-red-700"
                    >
                        <X className="mr-2 h-4 w-4" /> Rejeter
                    </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
