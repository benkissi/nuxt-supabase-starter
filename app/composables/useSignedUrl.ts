export const useSignedUrl = (
  expiresIn: number = 60 * 60 * 24, // Default to 24 hours
) => {
  const supabase = useSupabaseClient();
  const getPrivateImageUrl = async (bucket: string, path: string) => {
    if (!bucket || !path) {
      throw new Error("Bucket and path must be provided");
    }
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  };

  return { getPrivateImageUrl };
};
