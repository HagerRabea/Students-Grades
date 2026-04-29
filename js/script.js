// js/script.js
document.getElementById('gradeForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const studentID = document.getElementById('studentID').value.trim();
  const gradeDisplay = document.getElementById('gradeDisplay');

  if (!studentID) {
    gradeDisplay.innerHTML = '<p>Please enter your student ID.</p>';
    return;
  }

  const API_URL = 'https://api.sheetbest.com/sheets/122925e1-0a1e-416a-a663-5b52a70419e2';

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch grades (status ' + res.status + ')');
    const rows = await res.json();

    // Build map { ID: [grade1, grade2, ...] }
    const gradesMap = {};
    rows.forEach(row => {
      // Accept common ID header names (case-insensitive)
      const id = String(row.ID ?? row.Id ?? row.id ?? '').trim();
      if (!id) return;

      // Get grade cell (allow different header name possibilities)
      let rawGrade = row.Grade ?? row.grade ?? row.Score ?? row.score ?? '';
      rawGrade = (rawGrade === null || rawGrade === undefined) ? '' : String(rawGrade).trim();

      // Normalize empty grade
      const gradeVal = rawGrade === '' ? 'No grade recorded' : (isNaN(Number(rawGrade)) ? rawGrade : Number(rawGrade));

      if (!gradesMap[id]) gradesMap[id] = [];
      gradesMap[id].push(gradeVal);
    });

    // Lookup and show results
    if (studentID in gradesMap) {
      const entry = gradesMap[studentID];
      let html = `<h2>Your Grades</h2><ul>`;
      if (Array.isArray(entry) && entry.length) {
        entry.forEach((g, i) => {
          html += `<li>Quiz ${i+1} Grade: ${g}</li>`;
        });
      } else {
        html += `<li>No recorded grades</li>`;
      }
      html += `</ul><p>Bravo! May success always be with you.</p>`;
      gradeDisplay.innerHTML = html;
    } else {
      gradeDisplay.innerHTML = '<p>Student ID not found</p>';
    }

  } catch (err) {
    console.error('Error fetching or processing grades:', err);
    gradeDisplay.innerHTML = '<p>Error fetching grades. Check console for details.</p>';
  }
});
