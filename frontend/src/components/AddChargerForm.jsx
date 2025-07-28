// components/AddChargerForm.jsx
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AddChargerForm({ locationId, onClose }) {
  const handleAddCharger = async (e) => {
    e.preventDefault();
    const form = e.target;

    const newCharger = {
      name: form.name.value,
      power: form.power.value,
      type: form.type.value,
      status: form.status.value,
    };

    try {
      await axios.post(`/api/chargers/${locationId}`, newCharger, { withCredentials: true });
      toast.success('✅ Charger added successfully');
      if (onClose) onClose(); // close modal
    } catch (error) {
      toast.error('❌ Failed to add charger');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleAddCharger}>
      <input name="name" placeholder="Charger Name" required /><br />
      <input name="power" type="number" placeholder="Power (kW)" required /><br />
      <select name="type" required>
        <option value="AC">AC</option>
        <option value="DC">DC</option>
        <option value="Type2">Type2</option>
        <option value="CCS">CCS</option>
        <option value="CHAdeMO">CHAdeMO</option>
      </select><br />
      <select name="status" required>
        <option value="available">Available</option>
        <option value="plugged in">Plugged In</option>
        <option value="faulty">Faulty</option>
      </select><br />
      <button type="submit">Add Charger</button>
    </form>
  );
}
