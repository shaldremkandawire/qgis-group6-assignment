import { pool } from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.id,
        s.name,
        s.type,
        s.population,
        s.elevation,
        ST_AsGeoJSON(s.geom) AS geometry,
        s.created_at,
        GROUP_CONCAT(f.zone_name) AS flood_zones,
        GROUP_CONCAT(f.risk_level) AS risk_levels
      FROM settlements s
      LEFT JOIN flood_zones f ON ST_Contains(f.geom, s.geom)
      GROUP BY s.id
      ORDER BY s.name ASC
    `);
    
    return Response.json(rows);
  } catch (error) {
    console.error('Error fetching settlements:', error);
    return Response.json({ error: 'Failed to fetch settlements' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    const query = `
      INSERT INTO settlements (name, type, population, elevation, geom)
      VALUES (?, ?, ?, ?, ST_GeomFromText(?))
    `;
    
    // Create POINT WKT from lat/lng
    const pointWKT = `POINT(${data.lng} ${data.lat})`;
    
    await pool.query(query, [
      data.name,
      data.type,
      data.population,
      data.elevation,
      pointWKT
    ]);
    
    return Response.json({ message: 'Settlement added successfully' });
  } catch (error) {
    console.error('Error adding settlement:', error);
    return Response.json({ error: 'Failed to add settlement' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await pool.query('DELETE FROM settlements WHERE id = ?', [id]);
    
    return Response.json({ message: 'Settlement deleted successfully' });
  } catch (error) {
    console.error('Error deleting settlement:', error);
    return Response.json({ error: 'Failed to delete settlement' }, { status: 500 });
  }
}