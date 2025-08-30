        message: err.message,
            status: err?.response?.status,
            statusText: err?.response?.statusText,
            data: err?.response?.data
          });

          // Handle specific error types
          if (err.code === 'NETWORK_ERROR' || err.code === 'ENOTFOUND') {
            throw new Error("Network error. Please check your internet connection and try again.");
          }

          if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
            if (attempts < maxAttempts) {
              console.warn("Request timeout, retrying...");
              await sleep(3000);
              continue;
            } else {
              throw new Error("Request timeout. Please check your internet connection and try again.");
            }
          }

          // If it's the last attempt, throw the error
          if (attempts >= maxAttempts) {
            throw err;
          }

          // For other errors, wait a bit before retrying
          await sleep(2000);
        }
      }

      if (!predictions || predictions.length === 0) {
        throw new Error("No predictions returned from the AI model. The image may not be clear enough or may not contain recognizable plant issues.");
      }

      // 3. Process the top prediction
      const topPrediction = predictions[0];
      
      if (!topPrediction || typeof topPrediction !== 'object') {
        throw new Error("Invalid prediction format received from API");
      }

      console.log("Top prediction:", topPrediction);

      const rawLabel = 
        (typeof topPrediction.label === "string" && topPrediction.label.trim() !== "")
          ? topPrediction.label
          : "unknown";

      // Normalize label for knowledge base lookup
      const normalizedLabel = rawLabel
        .toLowerCase()
        .replace(/[_\-]+/g, " ")
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .trim();

      console.log("Normalized label:", normalizedLabel);

      // 4. Match with local knowledge base with extensive fallback logic
      console.log("Looking up in knowledge base:", normalizedLabel);
      console.log("Available keys:", Object.keys(localKnowledgeBase));
      
      let localInfo = localKnowledgeBase[normalizedLabel];
      
      // Try different fallback strategies if not found
      if (!localInfo) {
        // Try original raw label
        localInfo = localKnowledgeBase[rawLabel.toLowerCase()];
      }
      
      if (!localInfo) {
        // Try without specific crop name (e.g., "bacterial spot" instead of "bell pepper with bacterial spot")
        const genericDisease = normalizedLabel.replace(/^[^a-z]*\s*(with|having)?\s*/, '').trim();
        localInfo = localKnowledgeBase[genericDisease];
        console.log("Trying generic lookup:", genericDisease);
      }
      
      if (!localInfo) {
        // Try partial matches for common diseases
        const diseaseKeywords = ['blight', 'spot', 'rot', 'mildew', 'rust', 'wilt', 'canker'];
        for (const keyword of diseaseKeywords) {
          if (normalizedLabel.includes(keyword)) {
            const matchingKey = Object.keys(localKnowledgeBase).find(key => key.includes(keyword));
            if (matchingKey) {
              localInfo = localKnowledgeBase[matchingKey];
              console.log("Found partial match:", matchingKey);
              break;
            }
          }
        }
      }
      
      // Final fallback to unknown or create default
      if (!localInfo) {
        console.log("No match found, using fallback");
        localInfo = localKnowledgeBase["unknown"] || {
          scientific_name: `Unknown ${type}`,
          severity: "Medium", // Changed from Low to Medium for unknown diseases
          description: `This appears to be a ${type} affecting your plant. ${normalizedLabel.includes('spot') ? 'Spot diseases are often fungal or bacterial infections that can spread if not treated.' : 'Consider consulting with a local agricultural expert for proper identification and treatment.'}`,
          symptoms: [`Visible ${type} symptoms detected`, "May cause plant stress", "Could spread to other plants"],
          treatments: { 
            organic: [
              { 
                name: "Neem oil spray", 
                dosage: "5-10 ml per liter of water", 
                frequency: "Every 7-10 days", 
                safety: "Safe for beneficial insects when applied in evening" 
              },
              { 
                name: "Baking soda solution", 
                dosage: "1 tsp per liter of water", 
                frequency: "Every 5-7 days", 
                safety: "Test on small area first" 
              }
            ], 
            chemical: [
              {
                name: "Copper-based fungicide",
                dosage: "Follow manufacturer instructions",
                frequency: "As per label directions",
                safety: "Wear protective equipment, avoid spraying during bloom"
              }
            ], 
            preventive: [
              "Monitor plant regularly", 
              "Maintain good air circulation", 
              "Avoid overhead watering",
              "Remove affected plant parts",
              "Practice crop rotation",
              "Ensure proper plant spacing"
            ] 
          },
        };
      }

      // 5. Calculate confidence score
      const confidence = 
        typeof topPrediction.score === "number" && !isNaN(topPrediction.score)
          ? Math.round(Math.max(0, Math.min(100, topPrediction.score * 100)))
          : 0;

      console.log("Analysis complete:", {
        name: normalizedLabel,
        confidence,
        severity: localInfo.severity,
        fullResult: JSON.stringify({
          name: normalizedLabel || "unknown",
          scientific_name: localInfo?.scientific_name || `Unknown ${type}`,
          severity: localInfo?.severity || "Low",
          confidence,
          description: localInfo?.description || `This appears to be an unidentified ${type}.`,
          symptoms: Array.isArray(localInfo?.symptoms) ? localInfo.symptoms : [],
          treatments: {
            organic: Array.isArray(localInfo?.treatments?.organic) ? localInfo.treatments.organic : [],
            chemical: Array.isArray(localInfo?.treatments?.chemical) ? localInfo.treatments.chemical : [],
            preventive: Array.isArray(localInfo?.treatments?.preventive) ? localInfo.treatments.preventive : [],
          }
        }, null, 2)
      });

      // 6. Return in expected format with additional null checks
      const result = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        image: imageUri,
        type,
        crop: cropType || "Unknown crop",
        result: {
          name: normalizedLabel || "unknown",
          scientific_name: localInfo?.scientific_name || `Unknown ${type}`,
          severity: localInfo?.severity || "Low",
          confidence,
          description: localInfo?.description || `This appears to be an unidentified ${type}.`,
          symptoms: Array.isArray(localInfo?.symptoms) ? localInfo.symptoms : [],
          treatments: {
            organic: Array.isArray(localInfo?.treatments?.organic) ? localInfo.treatments.organic : [],
            chemical: Array.isArray(localInfo?.treatments?.chemical) ? localInfo.treatments.chemical : [],
            preventive: Array.isArray(localInfo?.treatments?.preventive) ? localInfo.treatments.preventive : [],
          },
        },
      };

      return result;

    } catch (error: any) {
      console.error("DetectionService.analyzeImage error:", {
        message: error.message,
        stack: error.stack,
        response: error?.response?.data,
        status: error?.response?.status
      });
      
      // Provide more user-friendly error messages
      let userMessage = error.message;
      
      if (error.message?.includes('Network Error') || error.code === 'NETWORK_ERROR') {
        userMessage = "Unable to connect to the analysis service. Please check your internet connection and try again.";
      } else if (error.message?.includes('timeout')) {
        userMessage = "The analysis is taking too long. Please try again with a smaller image or check your connection.";
      } else if (error.message?.includes('API key')) {
        userMessage = "Authentication failed. Please check the API configuration.";
      } else if (error.message?.includes('Rate limit')) {
        userMessage = "Too many requests. Please wait a moment before trying again.";
      } else if (!error.message || error.message === 'Image analysis failed') {
        userMessage = "Image analysis failed. Please ensure the image is clear and shows plant issues, then try again.";
      }
      
      throw new Error(userMessage);
    }
  }

  static async getDetectionHistory(): Promise<any[]> {
    // TODO: Implement persistent storage using AsyncStorage or SQLite
    console.log("getDetectionHistory called - implement persistent storage");
    return [];
  }

  static getSeverityColor(severity: string | undefined | null): string {
    if (!severity || typeof severity !== 'string') {
      return "#6b7280"; // Gray for unknown/invalid severity
    }
    
    const normalizedSeverity = severity.toLowerCase();
    switch (normalizedSeverity) {
      case "high":
      case "severe":
        return "#ef4444"; // Red
      case "medium":
      case "moderate":
        return "#f59e0b"; // Orange
      case "low":
      case "mild":
        return "#10b981"; // Green
      default:
        return "#6b7280"; // Gray
    }
  }

  static getConfidenceLevel(confidence: number): string {
    if (typeof confidence !== 'number' || isNaN(confidence)) {
      return "Unknown";
    }
    
    if (confidence >= 90) return "Very High";
    if (confidence >= 80) return "High";
    if (confidence >= 70) return "Good";
    if (confidence >= 60) return "Fair";
    return "Low";
  }
}