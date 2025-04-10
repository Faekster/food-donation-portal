import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateDonation = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [foodItems, setFoodItems] = useState([
    {
      name: "",
      category: "vegetables",
      quantity: 1,
      unit: "kg",
      expiryDate: "",
    },
  ]);

  const [formData, setFormData] = useState({
    pickupAddress: {
      street: "",
      city: "",
      postcode: "",
    },
    pickupTime: {
      from: "",
      to: "",
    },
    notes: "",
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      // Handle nested fields (address, pickup time)
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle change in food item fields
  const handleFoodItemChange = (index, field, value) => {
    const updatedItems = [...foodItems];
    updatedItems[index][field] = value;
    setFoodItems(updatedItems);
  };

  // Add a new food item
  const addFoodItem = () => {
    setFoodItems([
      ...foodItems,
      {
        name: "",
        category: "vegetables",
        quantity: 1,
        unit: "kg",
        expiryDate: "",
      },
    ]);
  };

  // Remove a food item
  const removeFoodItem = (index) => {
    if (foodItems.length > 1) {
      const updatedItems = [...foodItems];
      updatedItems.splice(index, 1);
      setFoodItems(updatedItems);
    }
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (foodItems.length === 0) {
      setError("Please add at least one food item");
      return;
    }

    // Check if all food items have names and expiry dates
    const invalidItems = foodItems.some(
      (item) => !item.name || !item.expiryDate
    );
    if (invalidItems) {
      setError("Please fill in all required fields for food items");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare donation data
      const donationData = {
        foodItems,
        pickupAddress: formData.pickupAddress,
        pickupTime: formData.pickupTime,
        notes: formData.notes,
      };

      // Submit to API
      await axios.post("http://localhost:5000/api/donations", donationData);

      // Redirect to dashboard on success
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create donation. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  // Get tomorrow's date in YYYY-MM-DD format for min date inputs
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Donation</h1>
        </div>
      </header>

      <main className="mt-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {error && (
                <div
                  className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
                  role="alert"
                >
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Food Items Section */}
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Food Items
                  </h2>

                  {foodItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium">Item #{index + 1}</h3>
                        {foodItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFoodItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor={`name-${index}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Item Name*
                          </label>
                          <input
                            type="text"
                            id={`name-${index}`}
                            value={item.name}
                            onChange={(e) =>
                              handleFoodItemChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            required
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                            placeholder="e.g., Apples, Bread, Rice"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`category-${index}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Category*
                          </label>
                          <select
                            id={`category-${index}`}
                            value={item.category}
                            onChange={(e) =>
                              handleFoodItemChange(
                                index,
                                "category",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="vegetables">Vegetables</option>
                            <option value="fruits">Fruits</option>
                            <option value="grains">Grains & Cereals</option>
                            <option value="dairy">Dairy</option>
                            <option value="protein">
                              Protein (Meat, Fish, etc.)
                            </option>
                            <option value="prepared">Prepared Meals</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor={`quantity-${index}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Quantity*
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              id={`quantity-${index}`}
                              value={item.quantity}
                              onChange={(e) =>
                                handleFoodItemChange(
                                  index,
                                  "quantity",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              min="1"
                              required
                              className="w-1/2 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                            <select
                              value={item.unit}
                              onChange={(e) =>
                                handleFoodItemChange(
                                  index,
                                  "unit",
                                  e.target.value
                                )
                              }
                              className="w-1/2 p-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                            >
                              <option value="kg">Kilograms (kg)</option>
                              <option value="g">Grams (g)</option>
                              <option value="items">Items</option>
                              <option value="packages">Packages</option>
                              <option value="liters">Liters</option>
                              <option value="servings">Servings</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor={`expiryDate-${index}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Expiry Date*
                          </label>
                          <input
                            type="date"
                            id={`expiryDate-${index}`}
                            value={item.expiryDate}
                            onChange={(e) =>
                              handleFoodItemChange(
                                index,
                                "expiryDate",
                                e.target.value
                              )
                            }
                            min={getTomorrowDate()}
                            required
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addFoodItem}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md"
                  >
                    + Add Another Item
                  </button>
                </div>

                {/* Pickup Information */}
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Pickup Information
                  </h2>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-3">Pickup Address</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label
                          htmlFor="street"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Street Address*
                        </label>
                        <input
                          type="text"
                          id="street"
                          name="pickupAddress.street"
                          value={formData.pickupAddress.street}
                          onChange={handleChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          City*
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="pickupAddress.city"
                          value={formData.pickupAddress.city}
                          onChange={handleChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="postcode"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Postcode*
                        </label>
                        <input
                          type="text"
                          id="postcode"
                          name="pickupAddress.postcode"
                          value={formData.pickupAddress.postcode}
                          onChange={handleChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>

                    <h3 className="font-medium mt-4 mb-3">Pickup Time</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="from"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Available From*
                        </label>
                        <input
                          type="datetime-local"
                          id="from"
                          name="pickupTime.from"
                          value={formData.pickupTime.from}
                          onChange={handleChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="to"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Available Until*
                        </label>
                        <input
                          type="datetime-local"
                          id="to"
                          name="pickupTime.to"
                          value={formData.pickupTime.to}
                          onChange={handleChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Additional Notes
                  </h2>

                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="4"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Add any special instructions or details about the donation..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? "Creating Donation..." : "Create Donation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateDonation;
