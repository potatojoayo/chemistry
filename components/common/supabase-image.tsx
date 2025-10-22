import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Image, ImageProps, View } from "react-native";

interface SupabaseImageProps extends Omit<ImageProps, "source"> {
  path: string;
  bucket?: string;
  fallback?: React.ReactNode;
  style?: any;
}

export default function SupabaseImage({
  path,
  bucket = "images",
  fallback,
  style,
  ...props
}: SupabaseImageProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!path) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, 60 * 60); // 1시간짜리 signed URL

        if (error) {
          console.error("Error creating signed URL:", error);
          setError(true);
        } else {
          setUrl(data.signedUrl);
        }
      } catch (err) {
        console.error("Error loading image:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [path, bucket]);

  if (loading) {
    return fallback || <View style={[{ backgroundColor: "#f0f0f0" }, style]} />;
  }

  if (error || !url) {
    return fallback || <View style={[{ backgroundColor: "#f0f0f0" }, style]} />;
  }

  return <Image source={{ uri: url }} style={style} {...props} />;
}
