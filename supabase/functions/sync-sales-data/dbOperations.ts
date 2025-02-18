
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { HeaderData, SaleData } from './types.ts';

export async function insertData(
  supabase: ReturnType<typeof createClient>,
  headerData: HeaderData,
  salesData: SaleData[]
): Promise<void> {
  // First insert the header record
  const { data: headerRecord, error: headerError } = await supabase
    .from('report_headers')
    .insert([headerData])
    .select()
    .single();

  if (headerError) {
    throw headerError;
  }

  // Prepare sales data with header ID
  const salesWithHeader = salesData.map(sale => ({
    ...sale,
    report_header_id: headerRecord.id
  }));

  // Use the upsert_sales_data function to handle duplicates
  const { error: salesError } = await supabase
    .rpc('upsert_sales_data', {
      p_sales_data: salesWithHeader
    });

  if (salesError) {
    console.error('Error upserting sales data:', salesError);
    throw salesError;
  }
}
