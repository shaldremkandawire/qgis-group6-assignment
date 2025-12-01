import { pool } from '@/lib/db';

export async function GET() {
  try {
    const [stats] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM settlements) as total_settlements,
        (SELECT COUNT(*) FROM flood_zones) as total_flood_zones,
        (SELECT COUNT(*) FROM high_risk_settlements) as high_risk_settlements,
        (SELECT COALESCE(SUM(population), 0) FROM high_risk_settlements) as total_population_at_risk
    `);
    
    return Response.json(stats[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return Response.json({ 
      total_settlements: 0,
      total_flood_zones: 0,
      high_risk_settlements: 0,
      total_population_at_risk: 0
    });
  }
}