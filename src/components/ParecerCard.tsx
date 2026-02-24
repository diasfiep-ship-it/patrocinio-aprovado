import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ParecerCardProps {
  title: string;
  content: string;
  variant?: "sti" | "educacao" | "final";
  editable?: boolean;
  onSave?: (value: string) => void;
  onLabelChange?: (value: string) => void;
  label?: string;
}

const variantStyles = {
  sti: "border-l-info",
  educacao: "border-l-warning",
  final: "border-l-success",
};

const variantTitleStyles = {
  sti: "text-info",
  educacao: "text-warning",
  final: "text-success",
};

const ParecerCard = ({ title, content, variant = "sti", editable = false, onSave, onLabelChange, label }: ParecerCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);

  const handleSave = () => {
    onSave?.(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(content);
    setIsEditing(false);
  };

  return (
    <div className={`bg-card rounded border border-border border-l-4 ${variantStyles[variant]} shadow-sm`}>
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${variantTitleStyles[variant]}`}>
          {title}
        </h3>
        {editable && !isEditing && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditing(true)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
        )}
        {editable && isEditing && (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-success" onClick={handleSave}>
              <Check className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={handleCancel}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
      {editable && onLabelChange && (
        <div className="px-4 pt-3 flex gap-2">
          <Badge
            className={`cursor-pointer text-xs px-3 py-1 ${
              label === "Favorável"
                ? "bg-success/15 text-success border border-success/30"
                : "bg-muted text-muted-foreground hover:bg-success/10 hover:text-success"
            }`}
            onClick={() => onLabelChange("Favorável")}
          >
            FAVORÁVEL
          </Badge>
          <Badge
            className={`cursor-pointer text-xs px-3 py-1 ${
              label === "Não Favorável"
                ? "bg-destructive/15 text-destructive border border-destructive/30"
                : "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            }`}
            onClick={() => onLabelChange("Não Favorável")}
          >
            NÃO FAVORÁVEL
          </Badge>
        </div>
      )}
      <div className="px-4 py-3">
        {isEditing ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[120px] text-sm"
            autoFocus
          />
        ) : (
          <p className="text-sm leading-relaxed text-card-foreground whitespace-pre-line">{content}</p>
        )}
      </div>
    </div>
  );
};

export default ParecerCard;
