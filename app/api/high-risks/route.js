import { pool } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const riskLevel = searchParams.get('risk_level') || 'HIGH';
    
    const [rows] = await pool.query(`
      SELECT 
        s.id,
        s.name,
        s.type,
        s.population,
        s.elevation,
        f.zone_name,
        f.risk_level,
        f.description,
        ST_AsGeoJSON(s.geom) AS settlement_geometry,
        ST_AsGeoJSON(f.geom) AS flood_zone_geometry,
        s.created_at
      FROM settlements s
      JOIN flood_zones f ON ST_Contains(f.geom, s.geom)
      WHERE f.risk_level = ?
      ORDER BY s.population DESC
    `, [riskLevel]);
    
    return Response.json(rows);
  } catch (error) {
    console.error('Error fetching high-risk settlements:', error);
    return Response.json({ error: 'Failed to fetch high-risk settlements' }, { status: 500 });
  }
}